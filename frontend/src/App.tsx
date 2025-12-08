import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo';
import { router } from './router';
import './App.css'

function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}

export default App;
