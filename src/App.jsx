import ProofreaderAppContainer from "./containers/ProofreaderAppContainer";

// App.jsx: Keeps the root lean by delegating everything to the container.

// Function App returns <ProofreaderAppContainer /> so all logic lives in the container layer.
function App() {
    return <ProofreaderAppContainer />;
}

// Default export exposes App to the entry file.
export default App;
