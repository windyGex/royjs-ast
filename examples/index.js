import {Action, Element} from '../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const code = `
const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};

const store = new Store({
    state: {
        count: 0
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
        }
    }
}, {
    plugins: [logger, devtools]
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
    render() {
        return (<div>
            <button onClick={() => this.edit('add', 'test')}>Add test action</button>
            <button onClick={() => this.edit('rename', 'reduce', 'plus')}>Rename reduce action</button>
            <button onClick={() => this.edit('remove', 'add')}>Remove add action</button>
            <pre>{this.state.code}</pre>
        </div>);
    }
}

const nodeCode = `
class App extends React.Component {

	render() {
    	return (<div className="test">
          	<Table>
          		<Table.Column title></Table.Column>
          	</Table>
          </div>);
    }
}
`;

class CodeApp extends React.Component {
    action = new Element(code)
    state = {
        code
    }
    edit = (type, oldName, newName) => {
        const code = this.action[type](oldName, newName);
        this.setState({
            code
        });
    }
    render() {
        return (<div>
            <button onClick={() => this.edit('add', 'test')}>Add test action</button>
            <button onClick={() => this.edit('rename', 'reduce', 'plus')}>Rename reduce action</button>
            <button onClick={() => this.edit('remove', 'add')}>Remove add action</button>
            <pre>{this.state.code}</pre>
        </div>);
    }
}

ReactDOM.render(<div><App/><CodeApp/></div>, document.querySelector('#container'));


