import React from 'react';

import Amplify from 'aws-amplify';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import MainRoute from '../src/routes/main'
// import LoginRoute from '../src/routes/login'

//import config from './config/aws-config'
import './App.css';



function App() {
  return (
    <Router>
      <Route exact path="/">
        <MainRoute />
      </Route>
    </Router>
  );
}


export default App;
