import { gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CREATE_ROOM = gql`
  mutation CreateRoom($named: String, $n: Int) {
    createRoom(name: $named, n: $n) {
      id
      Table {
        Cards {
          symbol
          key
          discovered
          discoveredBy {
            name
            score
            id
          }
        }
      }
      Users {
        name
        score
        id
      }
      ref
    }
  }
`

const MainPage = () => {
  const [info, setInfo] = useState({ username: '', idRoom: '', pairs: '' })
  const [createRoom, { loading: loadingCreate, error: errorOnCreate }] = useMutation(CREATE_ROOM)
  const navigate = useNavigate()

  const handleJoinRoom = () => {
    navigate(`/room/${info.idRoom}`, {
      state: {
        user: {
          name: info.username
        }
      }
    })
  }

  const handleCreateRoom = () => {
    createRoom({
      variables: {
        named: info?.username,
        n: parseInt(info?.pairs || '0', 10)
      }
    }).then(({ data }) => {
      navigate(`/room/${data.createRoom.id}`, {
        state: {
          user: data.createRoom.Users.find((item) => item.name === info?.username)
        }
      })
    })
  }

  if (loadingCreate) {
    return (
      <div className="landing-shell">
        <div className="hero-card text-center p-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="fw-bold mb-2">Preparing your room...</h3>
          <p className="text-muted mb-0">A moment please while the board is being created.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-shell">
      <div className="hero-card shadow-lg">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7">
            <div className="brand-badge">
              <i className="bi bi-grid-3x3-gap-fill me-2"></i>
              Memory challenge
            </div>

            <h1 className="display-4 fw-bold mb-3">The Memory Game</h1>
            <p className="lead text-muted mb-4">
              Gather your friends, build a room, and turn a simple matching game into a lively battle of focus and strategy.
            </p>

            <div className="mb-4">
              <label className="form-label fw-semibold">Username</label>
              <input
                className="form-control form-control-lg rounded-pill px-4"
                placeholder="Enter your nickname"
                value={info?.username}
                onChange={(item) => setInfo({ ...info, username: item.target.value })}
              />
            </div>

            <div className="d-flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-lg px-4 rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#joinRoom"
              >
                Join a room
              </button>

              <button
                type="button"
                className="btn btn-primary btn-lg px-4 rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#numberPairs"
              >
                Create a room
              </button>
            </div>

            {errorOnCreate ? (
              <div className="alert alert-danger mt-4 mb-0">
                Unable to create the room right now. Please try again.
              </div>
            ) : null}
          </div>

          <div className="col-lg-5">
            <div className="preview-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Quick start</h5>
                <span className="badge bg-light text-dark">New game</span>
              </div>

              <div className="preview-grid">
                <div className="preview-tile">
                  <i className="bi bi-person-plus-fill"></i>
                  <span>Pick a nickname</span>
                </div>
                <div className="preview-tile">
                  <i className="bi bi-door-open-fill"></i>
                  <span>Join or create a room</span>
                </div>
                <div className="preview-tile">
                  <i className="bi bi-controller"></i>
                  <span>Match all pairs</span>
                </div>
                <div className="preview-tile">
                  <i className="bi bi-trophy-fill"></i>
                  <span>Beat the leaderboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="joinRoom"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="joinToARoom"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-sm" role="document">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-0">
              <div>
                <h5 className="modal-title fw-bold" id="joinToARoom">Join a room</h5>
                <p className="mb-0 small text-muted">Enter the room code to continue the game</p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="roomCode" className="form-label">Room UUID</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  id="roomCode"
                  aria-describedby="roomCodeHelp"
                  value={info?.idRoom}
                  onChange={(item) => setInfo({ ...info, idRoom: item.target.value })}
                  placeholder="Paste the room code"
                />
                <div id="roomCodeHelp" className="form-text">
                  You can join a room that was already created by another player.
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn btn-primary rounded-pill px-4" data-bs-dismiss="modal" onClick={handleJoinRoom}>
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="numberPairs"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="numberPairs"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-sm" role="document">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-0">
              <div>
                <h5 className="modal-title fw-bold" id="numberPairsTit">Create a new room</h5>
                <p className="mb-0 small text-muted">Choose how many pairs your board will have</p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="pairsCount" className="form-label">Number of pairs</label>
                <input
                  type="number"
                  className="form-control rounded-pill"
                  id="pairsCount"
                  aria-describedby="pairsHelp"
                  value={info?.pairs}
                  onChange={(item) => setInfo({ ...info, pairs: item.target.value })}
                  placeholder="Example: 8"
                />
                <div id="pairsHelp" className="form-text">
                  The table will be generated with the number you enter.
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn btn-success rounded-pill px-4" data-bs-dismiss="modal" onClick={handleCreateRoom}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage