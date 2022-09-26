import React from "react";

import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import DashboardRoute from "../src/routes/dashboard";

import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <DashboardRoute />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
