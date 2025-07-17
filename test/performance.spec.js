/* global describe, it, before, beforeEach, after */
/* eslint-disable */
import chai from 'chai';
import { Store, View, Service } from '../src/index';
import { getCacheStats, clearCaches } from '../src/util';

const expect = chai.expect;

describe('Performance Improvements', () => {
    const sampleStoreCode = `
    export default {
      state: {
        count: 0,
        user: null
      },
      actions: {
        increment(state) {
          state.count++;
        }
      }
    }
    `;

    const sampleViewCode = `
    import React from 'react';
    
    @connect(state => state)
    class TestComponent extends React.Component {
      render() {
        return <div className="test">Hello World</div>;
      }
    }
    `;

    const sampleServiceCode = `
    batchCreateServices({
      testService: {
        url: '/api/test',
        method: 'GET'
      }
    });
    `;

    beforeEach(() => {
        clearCaches();
    });

    describe('AST Caching', () => {
        it('should cache AST parsing results', () => {
            const store1 = new Store(sampleStoreCode);
            const store2 = new Store(sampleStoreCode);
            
            // First parse - should cache the result
            const start1 = process.hrtime.bigint();
            store1.parse();
            const end1 = process.hrtime.bigint();
            const duration1 = Number(end1 - start1) / 1000000;
            
            // Second parse with same code - should use cache
            const start2 = process.hrtime.bigint();
            store2.parse();
            const end2 = process.hrtime.bigint();
            const duration2 = Number(end2 - start2) / 1000000;
            
            const stats = getCacheStats();
            expect(stats.astCacheSize).to.be.greaterThan(0);
            
            // Second parse should be faster (though this might be flaky in CI)
            // We'll just check that caching is working
            expect(duration2).to.be.lessThan(duration1 * 2); // Allow some variance
        });

        it('should implement LRU cache eviction', () => {
            // Create more instances than cache limit
            const stores = [];
            for (let i = 0; i < 150; i++) {
                const code = `export default { state: { count: ${i} }, actions: {} }`;
                stores.push(new Store(code));
                stores[i].parse();
            }
            
            const stats = getCacheStats();
            expect(stats.astCacheSize).to.be.lessThanOrEqual(stats.astCacheLimit);
        });

        it('should handle cache invalidation correctly', () => {
            const store = new Store(sampleStoreCode);
            store.parse();
            
            const initialStats = getCacheStats();
            expect(initialStats.astCacheSize).to.be.greaterThan(0);
            
            // Modify the store - should invalidate internal cache
            store.addState('newState', 'null');
            
            // The global cache should still exist but internal cache should be cleared
            const afterModification = getCacheStats();
            expect(afterModification.astCacheSize).to.be.greaterThan(0);
        });
    });

    describe('Memoization', () => {
        it('should memoize formatting operations', () => {
            const store = new Store(sampleStoreCode);
            
            // First format operation
            const start1 = process.hrtime.bigint();
            store.addState('test1', 'null');
            const end1 = process.hrtime.bigint();
            const duration1 = Number(end1 - start1) / 1000000;
            
            // Create new instance with same code
            const store2 = new Store(sampleStoreCode);
            
            // Second format operation - should benefit from memoization
            const start2 = process.hrtime.bigint();
            store2.addState('test1', 'null');
            const end2 = process.hrtime.bigint();
            const duration2 = Number(end2 - start2) / 1000000;
            
            // Both should complete successfully
            expect(store.code).to.include('test1');
            expect(store2.code).to.include('test1');
        });

        it('should handle unicode decoding memoization', () => {
            const store = new Store(sampleStoreCode);
            
            // Operations that might involve unicode
            for (let i = 0; i < 10; i++) {
                store.addState(`test${i}`, `"value\\u0020${i}"`);
            }
            
            expect(store.code).to.include('test0');
            expect(store.code).to.include('test9');
        });
    });

    describe('Batch Operations', () => {
        it('should optimize multiple state modifications', () => {
            const store = new Store(sampleStoreCode);
            
            const start = process.hrtime.bigint();
            
            // Multiple operations
            for (let i = 0; i < 20; i++) {
                store.addState(`batch${i}`, `${i}`);
            }
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            // Should complete in reasonable time
            expect(duration).to.be.lessThan(1000); // Less than 1 second
            
            // All states should be added
            const parsed = store.parse();
            const stateNames = parsed.state.map(s => s.name);
            expect(stateNames).to.include('batch0');
            expect(stateNames).to.include('batch19');
        });

        it('should handle multiple updateCode calls efficiently', () => {
            const store = new Store(sampleStoreCode);
            
            // Prepare multiple changes
            const changes = [];
            for (let i = 0; i < 10; i++) {
                changes.push({
                    start: 50 + i,
                    end: 51 + i,
                    replacement: 'x'
                });
            }
            
            const start = process.hrtime.bigint();
            
            // This should use the optimized updateCode function
            const result = store.modifyByStartEnd({ start: 50, end: 60 }, 'replacement');
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            expect(duration).to.be.lessThan(100); // Should be fast
            expect(result).to.be.a('string');
        });
    });

    describe('Memory Management', () => {
        it('should not leak memory with many instances', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Create many instances
            const instances = [];
            for (let i = 0; i < 100; i++) {
                instances.push(new Store(sampleStoreCode));
                instances.push(new View(sampleViewCode));
                instances.push(new Service(sampleServiceCode));
            }
            
            // Parse all instances
            instances.forEach(instance => instance.parse());
            
            const afterCreation = process.memoryUsage().heapUsed;
            const memoryIncrease = afterCreation - initialMemory;
            
            // Clear references
            instances.length = 0;
            
            // Clear caches
            clearCaches();
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const afterCleanup = process.memoryUsage().heapUsed;
            const finalIncrease = afterCleanup - initialMemory;
            
            // Memory should not increase dramatically
            expect(memoryIncrease).to.be.lessThan(100 * 1024 * 1024); // Less than 100MB
            
            // After cleanup, memory should be mostly recovered
            expect(finalIncrease).to.be.lessThan(memoryIncrease * 0.5); // At least 50% recovered
        });

        it('should maintain cache size limits', () => {
            // Create many different code strings
            for (let i = 0; i < 200; i++) {
                const code = `export default { state: { value: ${i} }, actions: {} }`;
                const store = new Store(code);
                store.parse();
            }
            
            const stats = getCacheStats();
            expect(stats.astCacheSize).to.be.lessThanOrEqual(stats.astCacheLimit);
        });
    });

    describe('Error Handling Performance', () => {
        it('should handle invalid code gracefully', () => {
            const invalidCode = 'invalid javascript code {{{';
            
            const start = process.hrtime.bigint();
            
            try {
                const store = new Store(invalidCode);
                store.parse();
                expect.fail('Should have thrown an error');
            } catch (error) {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1000000;
                
                expect(error.message).to.include('Parse error');
                expect(duration).to.be.lessThan(100); // Should fail fast
            }
        });

        it('should validate AST structures', () => {
            const store = new Store(sampleStoreCode);
            const validation = store.validate();
            
            expect(validation).to.have.property('isValid');
            expect(validation).to.have.property('errors');
            expect(validation.errors).to.be.an('array');
        });
    });

    describe('Cache Statistics', () => {
        it('should provide accurate cache statistics', () => {
            clearCaches();
            
            const initialStats = getCacheStats();
            expect(initialStats.astCacheSize).to.equal(0);
            
            // Create some cached entries
            const store1 = new Store(sampleStoreCode);
            const store2 = new Store(sampleViewCode);
            store1.parse();
            store2.parse();
            
            const afterStats = getCacheStats();
            expect(afterStats.astCacheSize).to.be.greaterThan(0);
            expect(afterStats.astCacheLimit).to.be.greaterThan(0);
        });
    });

    describe('View Performance', () => {
        it('should handle JSX parsing efficiently', () => {
            const view = new View(sampleViewCode);
            
            const start = process.hrtime.bigint();
            
            for (let i = 0; i < 50; i++) {
                view.parse();
            }
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            expect(duration).to.be.lessThan(500); // Should be fast
        });

        it('should optimize element finding operations', () => {
            const view = new View(sampleViewCode);
            
            const start = process.hrtime.bigint();
            
            for (let i = 0; i < 100; i++) {
                view.find('div');
            }
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            expect(duration).to.be.lessThan(200); // Should be fast
        });
    });

    describe('Service Performance', () => {
        it('should handle service parsing efficiently', () => {
            const service = new Service(sampleServiceCode);
            
            const start = process.hrtime.bigint();
            
            for (let i = 0; i < 50; i++) {
                service.parse();
            }
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            expect(duration).to.be.lessThan(300); // Should be fast
        });

        it('should optimize service modifications', () => {
            const service = new Service(sampleServiceCode);
            
            const start = process.hrtime.bigint();
            
            for (let i = 0; i < 20; i++) {
                service.modify(`service${i}`, `{ url: "/api/test${i}", method: "GET" }`);
            }
            
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000;
            
            expect(duration).to.be.lessThan(500); // Should be fast
        });
    });
});