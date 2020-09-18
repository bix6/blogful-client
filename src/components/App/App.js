import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Header from "../Header/Header";
import PrivateRoute from "../Utils/PrivateRoute";
import PublicOnlyRoute from "../Utils/PublicOnlyRoute";
import ArticleListPage from "../../routes/ArticleListPage/ArticleListPage";
import ArticlePage from "../../routes/ArticlePage/ArticlePage";
import LoginPage from "../../routes/LoginPage/LoginPage";
import RegistrationPage from "../../routes/RegistrationPage/RegistrationPage";
import NotFoundPage from "../../routes/NotFoundPage/NotFoundPage";
import TokenService from "../../services/token-service";
import AuthApiService from "../../services/auth-api-service";
import IdleService from "../../services/idle-service";
import "./App.css";

class App extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    console.error(error);
    return { hasError: true };
  }

  componentDidMount() {
    // Set the callback function for when a user goes idle
    IdleService.setIdleCallback(this.logoutFromIdle);

    // If a user is logged in
    if (TokenService.hasAuthToken()) {
      // register event listeners for when a user does something
      // if user doesn't trigger an event, idleCallback(logout) will be invoked
      IdleService.registerIdleTimerResets();

      // Tell token service to read JWT,
      // look at exp value and queue timeout before token expires
      TokenService.queueCallbackBeforeExpiry(() => {
        // timeout calls this callback just before token expires
        AuthApiService.postRefreshToken();
      });
    }
  }

  componentWillUnmount() {
    // when app unmounts, stop event listeners that auto logout
    IdleService.unRegisterIdleResets();
    // and remove refresh endpoint request
    TokenService.clearCallbackBeforeExpiry();
  }

  logoutFromIdle = () => {
    // remove token from localStorage
    TokenService.clearAuthToken();
    // remove any queued calls to refresh endpoint
    TokenService.clearCallbackBeforeExpiry();
    // remove timeouts that auto logout on idle
    IdleService.unRegisterIdleResets();
    // React doesn't know token has been removed
    // So force it to rerender
    this.forceUpdate();
  };

  render() {
    return (
      <div className="App">
        <header className="App__header">
          <Header />
        </header>
        <main className="App__main">
          {this.state.hasError && (
            <p className="red">There was an error! Oh no!</p>
          )}
          <Switch>
            <Route exact path={"/"} component={ArticleListPage} />
            <PublicOnlyRoute path={"/login"} component={LoginPage} />
            <PublicOnlyRoute path={"/register"} component={RegistrationPage} />
            <PrivateRoute
              path={"/article/:articleId"}
              component={ArticlePage}
            />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
