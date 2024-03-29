import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import "swiper/css";
import "./Voting.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { withCookies } from "react-cookie";

import bgImage from "../../assets/bg-team.svg";
import CountdownTimer from "../../components/countDown/CountDown";
import CountdownCalendar from "../../components/countDown/CountDownCalendar";

class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      election_name: [],
      election_organizer: [],
      election_id: [],
      final: [],
      id: null,
      isTimerExpired: false,
      isTimerRunning: false,
    };
    this.handleLogout = this.handleLogout.bind(this); // bind the method to the component's context
  }

  // handleTimerStart = () => {
  //   this.setState({ isTimerRunning: true });
  // };

  // handleTimerStop = () => {
  //   this.setState({ isTimerRunning: false });
  // };

  handleLogout() {
    const { cookies } = this.props;
    cookies.set("voterLoggedIn", false);
    localStorage.setItem("voter", false);
    window.location.href = "http://localhost:3000/voter";
  }

  componentDidMount() {
    var image = new Image();

    let currentComponent = this;

    axios
      .get("http://localhost:3001/api/electionName", {})
      .then(function (response) {
        var data = response.data;
        currentComponent.setState({
          final: data,
        });
      })
      .catch(function (err) {
        console.error(err);
      });

    //NEW CODE to get user images
    axios
      .get("http://localhost:3001/api/getImages", {
        params: {
          email: "vardhjainrox@gmail.com",
        },
      })
      .then(function (response) {
        image.src = response.data.idFrontImage;
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  handleInputChange = (e) => {
    // console.log(e.target.innerHTML);
    var name = e.target.innerHTML;
    var index = 0;
    for (let i = 0; i < this.state.election_name.length; i++) {
      if (name === this.state.election_name[i]) {
        index = i;
        break;
      }
    }
    var id = this.state.election_id[index];
    this.setState({
      id: id,
    });
  };

  render() {
    // const { isTimerRunning } = this.state;
    //If admin is not logged in display:
    const { cookies } = this.props;
    // console.log(cookies.get('voterLoggedIn'));
    if (cookies.get("voterLoggedIn") == "false") {
      return (
        <>
          <h1>You have not logged in</h1>
        </>
      );
    }
    const electionList = this.state.final.map((election) => {
      return (
        <div className="election-item" key={election.election_id}>
          <div className="voting-contact">
            {/* <li className="collection-item avatar"> */}
            <Link
              to={"/vote/" + election.election_id}
              className="voting-title"
              onClick={this.handleInputChange}
            >
              {election.election_name}
            </Link>
            {/* </li> */}
          </div>
        </div>
      );
    });

    const handleTimerExpiry = () => {
      // This function will be called when the timer reaches 0
      this.setState({ isTimerExpired: true });
    };

    const handleTimerRunning = () => {
      this.setState({ isTimerRunning: true });
    };

    // const { isTimerExpired, isTimerRunning } = this.state;

    return (
      <>
        <Navbar
          style={{ backgroundColor: "#0089d6" }}
          bg="#0089d6"
          expand="lg"
          variant="light"
        >
          {/* <Navbar.Brand href="/">React-Bootstrap</Navbar.Brand> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="px-2 mr-auto">
              <Nav.Link className="px-4 nav-items" href="/voting">
                Elections
              </Nav.Link>
              <Nav.Link className="px-4 nav-items" href="/">
                Home
              </Nav.Link>
              <Nav.Link className="px-4 nav-items" onClick={this.handleLogout}>
                Log Out
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <header className="header" style={{ backgroundColor: "#0089d6" }}>
          <div className="header-content">
            <div className="header-text">
              <h1 className="header-title">Election Page</h1>
              <p className="header-description">
                "Embrace Your Civic Duty." Join the ongoing election and
                exercise your right to vote.
              </p>
            </div>
            <div className="header-image">
              <img src={bgImage} alt="Election Team" />
            </div>
          </div>
        </header>
        <CountdownTimer onExpiry={handleTimerExpiry} />
        {this.state.isTimerExpired ? (
          <div className="election-list-disabled">{electionList}</div>
        ) : (
          <div className="election-list">{electionList}</div>
        )}
        {/* <CountdownCalendar
          onExpiry={handleTimerExpiry}
          disabled={true}
          // timerStartedCallback={handleTimerRunning}
        />
        {this.state.isTimerExpired ? (
          <div className="election-list-disabled">{electionList}</div>
        ) : (
          <div className="election-list">{electionList}</div>
        )} */}
      </>
    );
  }
}

export default withCookies(Voting);
