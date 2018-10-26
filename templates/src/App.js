import React from 'react';

class App extends React.Component {
    render() {
        return <div>
            <h1>Hello React & Webpack!</h1>
            <ul>
                {
                    ['lili', 'mary', 'Jones'].map((name, index) => <li key={index}>{`I'm ${name}!`}</li> )
                }
            </ul>
        </div>
    }
}

export default App;