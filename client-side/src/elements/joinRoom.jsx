import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import arrayShuffle from 'array-shuffle'

const JOIN_ROOM = gql`
    mutation JoinRoom($username: String, $idRoom: ID) {
        joinRoom(username: $username, idRoom: $idRoom) {
            id
            ref
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
        }
    }
`

const GET_ROOM = gql`
    query GetRoom($getRoomId: ID!) {
        getRoom(id: $getRoomId) {
            id
            ref
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
        }
    }
`

const UPDATE_ROOM_SUBSCRIPTION = gql`
subscription RoomUpdated($idRoom: String) {
  roomUpdated(idRoom: $idRoom) {
    id
    ref
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
  }
}
`

const UPDATE_CARD = gql`
mutation UpdateCard($idRoom: ID, $keyCard: ID, $cardStatus: CardStatusInput) {
    updateCard(idRoom: $idRoom, keyCard: $keyCard, cardStatus: $cardStatus) {
      Table {
        Cards {
          discovered
          discoveredBy {
            score
            name
            id
          }
          key
          symbol
        }
      }
      Users {
        id
        name
        score
      }
      id
      ref
    }
}
`

const JoinRoom = () => {
    const { id } = useParams()
    const { state: localState } = useLocation()
    const navigate = useNavigate()

    const [joinRoom] = useMutation(JOIN_ROOM)
    const [getRoom, { subscribeToMore: onUpdateRoom }] = useLazyQuery(GET_ROOM)

    const [roomData, setRoomData] = useState({})
    const [initedDeck, setInitedDeck] = useState(false)

    useEffect(() => {
        if (localState?.user == null) {
            return
        }

        if (localState.user?.id === undefined && localState.user?.name != null) {
            joinRoom({
                variables: {
                    idRoom: id,
                    username: localState.user.name
                }
            }).then((response) => {
                navigate(`/room/${id}`, {
                    state: {
                        user: response.data?.joinRoom.Users.find((item) => item.name === localState?.user?.name)
                    }
                })
            })
            return
        }

        getRoom({
            variables: {
                getRoomId: id
            }
        }).then((response) => {
            setRoomData(response.data?.getRoom)
        })
    }, [joinRoom, getRoom, localState, id, navigate])

    useEffect(() => {
        if (!roomData?.Table?.Cards) {
            return
        }

        setInitedDeck((currentDeck) => {
            if (currentDeck === false || currentDeck.length === 0) {
                return arrayShuffle(
                    Array.from(roomData.Table.Cards).flatMap((item) => [item, item])
                )
            }

            return currentDeck.map((item) => {
                return roomData?.Table?.Cards.find((subitem) => subitem.key === item?.key) ?? item
            })
        })
    }, [roomData?.Table?.Cards])

    const roomUsers = roomData?.Users ?? []
    const roomId = roomData?.id ?? id

    return (
        <div className="room-shell">
            <div className="room-panel shadow-lg">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="room-sidebar">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <div className="brand-badge small">
                                        <i className="bi bi-lightning-charge-fill me-2"></i>
                                        Live room
                                    </div>
                                    <h2 className="h4 fw-bold mb-1">The Memory Game</h2>
                                </div>
                                <a className="btn btn-outline-light btn-sm rounded-pill" href="../">Leave</a>
                            </div>

                            <div className="room-hero-card p-3 mb-3">
                                <p className="text-muted mb-1">Welcome back</p>
                                <h3 className="h5 fw-bold mb-2">{localState?.user?.name ?? 'Player'}</h3>
                                <p className="mb-0 small text-muted">Room ID: {roomId}</p>
                            </div>

                            <div className="room-scoreboard p-3">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h4 className="h6 fw-bold mb-0">Scoreboard</h4>
                                    <span className="badge bg-light text-dark">{roomUsers.length} players</span>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col" className="text-end">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roomUsers.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.name}</td>
                                                    <td className="text-end fw-semibold">{item.score}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="room-board-card h-100">
                            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
                                <div>
                                    <h3 className="h4 fw-bold mb-1">Choose two cards</h3>
                                    <p className="text-muted mb-0">Match the symbols to score points and keep the streak alive.</p>
                                </div>
                                <span className="status-pill">Live updates</span>
                            </div>

                            <div className="game-board">
                                {initedDeck !== undefined && initedDeck !== false ? (
                                    <CreateTable
                                        tableData={initedDeck}
                                        onUpdateRoom={onUpdateRoom({
                                            document: UPDATE_ROOM_SUBSCRIPTION,
                                            variables: {
                                                idRoom: id
                                            },
                                            updateQuery: (prev, { subscriptionData }) => {
                                                if (!subscriptionData.data) {
                                                    return false
                                                }

                                                setRoomData(subscriptionData?.data?.roomUpdated)
                                                return { ...subscriptionData, ...prev }
                                            }
                                        })}
                                    />
                                ) : (
                                    <div className="empty-state">
                                        <i className="bi bi-emoji-smile-fill"></i>
                                        <p className="mb-0">The room is loading. Wait a moment while the board appears.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JoinRoom

const CreateTable = ({ tableData }) => {
    const [updateCard] = useMutation(UPDATE_CARD)
    const { id } = useParams()
    const { state: localState } = useLocation()
    const deck = tableData
    let previousIndex = false

    return (
        <div className="memory-grid">
            {deck.map((item, index) => {
                if (item?.discovered) {
                    return (
                        <button className="memory-card discovered" key={item?.key ?? index} disabled>
                            <span>{item?.symbol}</span>
                        </button>
                    )
                }

                return (
                    <button
                        className="memory-card"
                        key={item?.key ?? index}
                        onClick={(element) => {
                            const target = element.currentTarget
                            target.classList.add('selected')
                            target.innerHTML = `<span>${deck[index]?.symbol ?? '❓'}</span>`

                            const selectedItems = Array.from(document.getElementsByClassName('selected'))
                            if (selectedItems.length === 2) {
                                if (deck[index].key === deck[previousIndex].key) {
                                    updateCard({
                                        variables: {
                                            idRoom: id,
                                            keyCard: deck[index].key,
                                            cardStatus: {
                                                discovered: true,
                                                discoveredBy: {
                                                    id: localState.user.id,
                                                    name: localState.user.name
                                                }
                                            }
                                        }
                                    })
                                }

                                setTimeout(() => {
                                    Array.from(document.getElementsByClassName('selected')).forEach((itemElement) => {
                                        itemElement.classList.remove('selected')
                                        itemElement.innerHTML = '<span>?</span>'
                                    })
                                }, 700)

                                previousIndex = false
                                return true
                            }

                            previousIndex = index
                            return true
                        }}
                    >
                        <span>?</span>
                    </button>
                )
            })}
        </div>
    )
}