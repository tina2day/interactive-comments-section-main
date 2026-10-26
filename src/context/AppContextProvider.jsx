import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
async function parseData(api) {
  const response = await fetch(api)
  if(!response.ok) {
    throw new Error(response.status)
  }
  return response.json()
}
export default function AppContextProvider({children}) {
    const [comments, setComments] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    useEffect(()=> {
      async function loadData() {
        try{
          const newCurrentUser = await parseData("https://6adfb8f08e42963c8d5e5114.mockapi.io/currentUser/1")
          const newComments = await parseData("https://6adfb8f08e42963c8d5e5114.mockapi.io/comments")
          setComments(newComments)
          setCurrentUser(newCurrentUser)
        } catch(err) {
          console.log(err.message)
        }
      }
      loadData()
    }, [])
    async function handleReply(parentComment) {
      const response = await fetch(`https://6adfb8f08e42963c8d5e5114.mockapi.io/comments/${parentComment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parentComment)
      })
      if(!response.ok) {
        throw new Error(response.status)
      }
      return response.json()
    }
    return (
        <AppContext.Provider
          value={{ currentUser, setCurrentUser, comments, setComments, handleReply }}
        >
          {comments !== null && currentUser !== null
            ? children
            : <p>Загрузка...</p>}
        </AppContext.Provider>
    )
}