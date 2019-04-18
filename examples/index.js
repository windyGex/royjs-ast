import {Action, Element, Service} from '../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const code = `
const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};

export default ({
    state: {
        count: 0,
        ds: [],
        test: {
            a: 1
        },
        bool: true
    },
    actions: {
        add(state, payload) {
            const {count} = state;
            state.set('count', count + 1);
        },
        reduce(state, payload) {
            const {count} = state;
            state.set('count', count - 1);
        },
        asyncAdd(state, payload) {
            setTimeout(() => {
                this.dispatch('add');
            }, 500);
        },
        fetch(state, payload) {
            this.request.post('url', {
                a: 1,
                b: 2
            }, {

            });
        }
    }
});
`;

class App extends React.Component {
    action = new Action(code)
    state = {
        code
    }
    edit = (type, oldName, newName) => {
        const code = this.action[type](oldName, newName);
        this.setState({
            code
        });
    }
    componentDidMount() {
        console.log(this.action.parse());
    }
    render() {
        return (<div>
            <button onClick={() => this.edit('addState', 'test', 1)}>Add test state</button>
            <button onClick={() => this.edit('add', 'test')}>Add test action</button>
            <button onClick={() => this.edit('rename', 'reduce', 'plus')}>Rename reduce action</button>
            <button onClick={() => this.edit('remove', 'add')}>Remove add action</button>
            <button onClick={() => this.edit('modify', 'add', 'add(state, payload) {}')}>modify add action</button>
            <button onClick={() => this.edit('modifyState', 'count', '1')}>modify count state</button>
            <button onClick={() => this.edit('renameState', 'ds', 'dataSource')}>rename ds state</button>
            <button onClick={() => this.edit('modifyByStartEnd', {
                start: 737,
                end: 742
            }, '"testurl"')}>modify url</button>
            <pre>{this.state.code}</pre>
        </div>);
    }
}

const nodeCode = `
import { Button } from '@alife/hippo';
const e = <div></div>;

@inject(store)
class App extends React.Component {

	render() {
        const {name} = this.props.state;
    	return (<div className="test">
          	<Table>
                  <Table.Column title="测试中文"></Table.Column>
                  <Table.Column data-roy-id="uuid"></Table.Column>
          	</Table>
          </div>);
    }
}

@connect(store)
class Demo extends React.Component {

	render() {
        const {name} = this.props;
    	return (<div className="test">
          	<Table>
                  <Table.Column title="测试中文"></Table.Column>
                  <Table.Column data-roy-id="uuid"></Table.Column>
          	</Table>
          </div>);
    }
}
`;

class CodeApp extends React.Component {
    action = new Element(nodeCode)
    state = {
        code: nodeCode
    }
    edit = (type, oldName, newName, other, other2, other3) => {
        const code = this.action[type](oldName, newName, other, other2, other3);
        if (typeof code === 'string') {
            this.setState({
                code
            });
        } else {
            console.log(code);
        }
    }
    render() {
        return (<div>
            <button onClick={() => this.edit('parse')}>findAllNode</button>
            <button onClick={() => this.edit('find', 'Table')}>findNode Table</button>
            <button onClick={() => this.edit('afterByStart', 216, '<div>after</div>')}>afterByStart</button>
            <button onClick={() => this.edit('addByStart', 216, '<div>add</div><div>remove</div>')}>addByStart</button>
            <button onClick={() => this.edit('addByStart', 216, '<div>add</div><div>remove</div>', '', '', true)}>addByStartOverride</button>
            <button onClick={() => this.edit('beforeByStart', 216, '<div>before</div>', 'Div, A', '@alife/hippo')}>beforeByStart</button>
            <button onClick={() => this.edit('findByStart', 216)}>findNode by start</button>
            <button onClick={() => this.edit('addState', 216, 'loading', 'visible.a')}>add State by start</button>
            <button onClick={() => this.edit('addState', 548, 'loading', 'visible.a')}>add State for connect by start</button>
            <button onClick={() => this.edit('cloneByStart', 216)}>cloneNode by start</button>
            <button onClick={() => this.edit('findById', 'uuid')}>findNode By data-roy-id</button>
            <button onClick={() => this.edit('attrs', 'Table', 'loading', 2)}>Attrs number Table</button>
            <button onClick={() => this.edit('attrs', 'Table', 'type', true)}>Attrs bool Table</button>
            <button onClick={() => this.edit('attrs', 'Table', 'rowSelection', "{a: 'b'}")}>Attrs object Table</button>
            <button onClick={() => this.edit('attrs', 'Table', 'str', "'string'")}>Attrs string Table</button>
            <button onClick={() => this.edit('attrs', 'Table', 'rowSelection', "<div></div>")}>Attrs element Table</button>
            <button onClick={() => this.edit('rename', 'div', 'span')}>Rename div to span</button>
            <button onClick={() => this.edit('add', 'div', '<span>123</span>')}>Add span to div</button>
            <button onClick={() => this.edit('remove', 'Table.Column')}>Remove Table.Column</button>
            <pre>{this.state.code}</pre>
        </div>);
    }
}

const scode = `
import { batchCreateServices } from '@alife/legion';

export default batchCreateServices({
  getDelivererInfo: {
    url: '//rap2api.alibaba-inc.com/app/mock/2209/ehr/dock/deliverer/getDelivererInfo',
    method: 'post',
    formatter: () => {},
    normalizer: () => {},
  }
});
`;
class ServiceApp extends React.Component {
    action = new Service(scode)
    state = {
        code: scode
    }
    edit = (type, oldName, newName, other, other2, other3) => {
        const code = this.action[type](oldName, newName, other, other2, other3);
        if (typeof code === 'string') {
            this.setState({
                code
            });
        } else {
            console.log(code);
        }
    }
    render() {
        return (<div>
            <button onClick={() => this.edit('parse')}>parse</button>
            <button onClick={() => this.edit('remove', 'getDelivererInfo')}>remove</button>
            <button onClick={() => this.edit('modify', 'getDelivererInfo', `{
                url: 'a',
                method: 'post',
                formatter: () => {},
                normalizer: () => {}
            }`)}>modify</button>
            <pre>{this.state.code}</pre>
        </div>);
    }
}

ReactDOM.render(<div><CodeApp/><App/><ServiceApp/></div>, document.querySelector('#container'));


