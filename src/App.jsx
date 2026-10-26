// import { useState } from 'react'
import { useContext, useRef } from 'react';
import './App.css'
import CommentItem from './components/CommentItem';
import CommentRepliesList from './components/CommentRepliesList';
import { AppContext } from './context/AppContext';




function App() {
  const {currentUser, comments, setComments} = useContext(AppContext)
  const textRef = useRef(null)
  async function handleText() {
    const text = textRef.current.value.trim()
    if(text.length !== 0) {
      const newComment = {
      content: text,
      createdAt: "just now",
      score: 0,
      user: {
        image: currentUser.image,
        username: currentUser.username
      },
      "replies": []
    }
      const response = await fetch("https://6adfb8f08e42963c8d5e5114.mockapi.io/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newComment)
      }
      )
      if(!response.ok) {
        throw new Error(response.status)
      }
      return response.json()
  }
}
  async function onSubmit(e) {
    e.preventDefault()
    try{
      const comment = await handleText()
      if(!comment) return
      setComments((prev)=> [...prev, comment])
      textRef.current.value = ''
    } catch(err) {
      console.log(err.message)
    }
    }
  return (
    <>
      {comments.map(({id, content, createdAt, score, user, replies}) => replies.length === 0?
      <CommentItem id={id} key={id} content={content} createdAt={createdAt} score={score} user={user}/>:
      <><CommentItem id={id} content={content} createdAt={createdAt} score={score} user={user} />
      <CommentRepliesList replies={replies}/></>)}
      <form className='add__content' onSubmit={onSubmit}>
        <div className='comment__input'>
          <img className='comment__avatar' src={currentUser.image.png}/>
          <textarea className='comment__add' placeholder='Add a comment...' ref={textRef}></textarea>
          <button className='send' type="submit">SEND</button>
        </div>
      </form>
    </>
  )
}

export default App
