import React from "react"
import styled from "styled-components"

import { observable, computed, autorun, action } from "mobx"
import { observer, Observer } from "mobx-react"
import { Image } from "reakit"
import { white, beige, lightgrey, darkgrey } from "./colors"
import logo from "./logo.png"
import ErrorBoundary from "./primitives/ErrorBoundary"

// Crypto & authentication
// import KJUR from "jsrsasign"

// Utility
import Account from "./Account"
import { DateTime } from "luxon"

// Pages
import Flash from "./components/Flash"
import Home from "./components/Home"
import Menu from "./components/Menu"
import Navigation from "./components/Navigation"

import InternalLink from "./primitives/InternalLink"
import WithCredentials from "./primitives/WithCredentials"

// Language
import english from "./languages/en"

import Network from "./Network"
let network = new Network(process.env.REACT_APP_URL_API)

@observer
class Assembly extends React.Component {
  @observable dictionary = english
  @observable alerts = []
  @observable currentPage = null
  @observable menu = {}

  // Given...
  // * the remembered route
  // * all of the data present in the application
  //
  // ...determine what to display.
  @action route() {
    this.currentPage = Home
  }

  constructor(props) {
    super(props)
    this.route()

    if(props.afterCreation)
      props.afterCreation(this)
  }

  // Alerts
  alert(message) { this.alerts.push(message) }

  dismissAlert(message) {
    var index = this.alerts.indexOf(message);
    if (index > -1) this.alerts.splice(index, 1);
  }

  login() {
  }

  set(tag, value) {
    let data = this
    let parts = tag.split(".")

    parts.forEach((part, index) => {
      if(index === parts.length - 1)
        data[part] = value
      else
        data = data[part]
    })
  }

  fetch = (tag) => {
    let data = this
    tag
      .split(".")
      .forEach(part => data = data[part])
    return data
  }

  translate(semantic) {
    let semantic_words = semantic.split(".")
    let dictionary = this.dictionary

    // TODO this is a clumsy way to do a nested look up.
    for (var i=0; i < semantic_words.length; i++) {
      if(!dictionary[semantic_words[i]]) {
        console.log(`Error! Could not find translation of "${semantic_words[i]}", of ${semantic}`)
        return "Error! Translation not found."
      }

      dictionary = dictionary[semantic_words[i]];
    }

    return dictionary;
  }

  @computed get locale() {
    return "en"
  }

  logout() {
    network.clearWatches()
    this.currentPage = Home
  }

  render = () => (
    <Layout>
      <AuthBar>
        <InternalLink to={Home} assembly={this} >
          <Image src={logo} width="1.5rem" height="1.5rem"/>
          <Title>{this.translate("titles.default")}</Title>
        </InternalLink>

        <Menu assembly={this} />

        <Drawer>
          <Observer>
            {() => this.alerts.map(alert => (
              <Flash
                key={alert}
                message={alert}
                onDismiss={() => this.dismissAlert(alert)}
              />
            ))}
          </Observer>
        </Drawer>
      </AuthBar>

      <Space />

      <Content>
        <Observer>
          {() =>
            this.currentPage
            ? <ErrorBoundary assembly={this}>
                { React.createElement(this.currentPage, { assembly: this }) }
              </ErrorBoundary>
            : null
          }
        </Observer>
      </Content>

      <Space />

      <NavBar>
        <Navigation assembly={this} />
      </NavBar>
    </Layout>
  )
}

const Layout = styled.div`
  height: 100vh;
  background-size: cover;

  background: ${beige};
  color: ${darkgrey};

  display: grid;
  grid-template-rows: 4rem auto 4rem;
`

const NavBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid ${lightgrey};
`

const AuthBar = styled.div`
  background-color: ${white};
  padding: 1rem;
  position: fixed;
  z-index: 10;
  right: 0;
  left: 0;

  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-column-gap: 1rem;
  align-items: baseline;

  border-radius: 2px;
  border-bottom: 2px solid rgba(100, 100, 100, 0.2);
`

// We need something to reserve the space of the bottom navigation bar.
const Space = styled.div`
`

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 0;
  display: inline-block;
  color: black;
  vertical-align: super;
  padding-left: 0.25em;
`

// A handy space just below the top bar, for showing miscellaneous content.
// Disappears when not in use.
const Drawer = styled.div`
  bottom: 0px;
  height: 0px;

  margin-left: auto;
  margin-right: auto;
  position: absolute;
  width: 90%;
`

const Content = styled.div`
  padding: 0 1rem;
  background: ${beige};
`

export default Assembly