import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Main from './pages/Main/Main';
import PageNotFound from './pages/PageNotFound/PageNotFound';

import './App.css';

const App = () => (
  <div className="App">
    <Switch>
      <Route exact path='/'>
        <Redirect to='/covid-map-app/' />
      </Route>
      <Route exact path='/covid-map-app/'>
        <Main />
      </Route>
      <PageNotFound />
    </Switch>
  </div>
);

export default App;
