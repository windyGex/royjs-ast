/* global describe, it, before */
/* eslint-disable */
import chai from 'chai';
import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import {Store, inject, connect, Provider, compose} from '../src/index';
import {JSDOM} from 'jsdom';
import sinon from 'sinon';

const doc = new JSDOM('<!doctype html><html><body></body></html>');
global.document = doc.window.document;
global.window = doc.window;

Enzyme.configure({ adapter: new Adapter() });

chai.expect();

const expect = chai.expect;

describe('Should support parse', () => {

});

describe('should support view', () => {
    describe('should support view state crud', () => {
        const text = `
            @connect(state => state)
            class A extends React.Component {
                render() {

                }
            }
        `;

    });
});
