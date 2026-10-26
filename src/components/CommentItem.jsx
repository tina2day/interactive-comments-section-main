import { useContext, useState, useRef } from 'react';
import Button from './Button';
import { AppContext } from '../context/AppContext';
export default function CommentItem(props) {
    const {
        id,
        content, 
        createdAt, 
        score, 
        user,
        replyingTo=null
    } = props
    const [isOpenReply, setOpenReply] = useState(false)
    const [isOpenEdit, setOpenEdit] = useState(false)
    const editTextRef = useRef(null)
    const deleteTextRef = useRef(null)
    const {currentUser, comments, setComments, handleReply} = useContext(AppContext)
    const replyTextRef = useRef(null)
    
    async function onSubmit(e) {
      e.preventDefault()
      const textReply = replyTextRef.current.value.trim()
      if (!textReply) return
      const parentComment = comments.find(comment =>
      String(comment.id) === String(id) ||
      comment.replies.some(reply => String(reply.id) === String(id))
      )
      if (!parentComment) return
      const replies = [...parentComment.replies]
      if(textReply.length !== 0) {
        const newReply = {
          id: crypto.randomUUID(),
          content: textReply,
          createdAt: "just now",
          score: 0,
          replyingTo: user.username,
          user: {
            image: currentUser.image,
            username: currentUser.username
          }
        }
        replies.push(newReply)
        try{await handleReply( { ...parentComment, replies })
      setComments((prev)=>prev.map((comment)=>{
        if(String(comment.id) === String(parentComment.id)) {
        return {...parentComment, replies}
      }
      return comment
      }))
      setOpenReply(false)
    } catch(err) {
        console.log(err.message)
      }
      }
    }
    async function onEditSubmit(e) {
      e.preventDefault()
      const text = editTextRef.current.value.trim()
      if(text.length===0) return
      const parentComment = comments.find(comment =>
      String(comment.id) === String(id) ||
      comment.replies.some(reply => String(reply.id) === String(id))
      )
      if (!parentComment) return
      const newComment = String(parentComment.id) === String(id)?
      {...parentComment, content: text}:
      {...parentComment, replies: parentComment.replies.map((reply)=>{
        if(String(reply.id)===String(id)) {
          return {...reply, content: text}
        }
        return reply
      })}
      try {
        await handleReply(newComment)
        setComments((prev)=>prev.map((comment)=>{
        if(String(comment.id) === String(parentComment.id)) {
            return newComment
      }
      return comment
      }))
      setOpenEdit(false)
      } catch(err) {
        console.log(err.message)
      }
      
    }
    async function handleDelete() {
      const response = await fetch(`https://6adfb8f08e42963c8d5e5114.mockapi.io/comments/${id}`, {
        method: "DELETE"
      })
      if(!response.ok) {
        throw new Error(response.status)
      }
    }
    async function onClickDelete() {
      const isParent = comments.find((comment)=>String(comment.id)===String(id))!==undefined?true:false
      try{
        if(isParent) {
          await handleDelete()
          setComments((prev) => prev.filter((comment)=>{
          if(String(comment.id)===String(id)){
            return false
          }
          return true
        }))
        } else {
          const parentComment= comments.find((comment)=>
      {
        if(comment.replies.find(reply=>String(reply.id)===String(id))!==undefined){
        return true
      } return false
      })
      if (!parentComment) return
      const replies = parentComment.replies.filter((reply)=>String(reply.id)!==String(id))
          await handleReply({...parentComment, replies})
          setComments((prev)=>prev.map((comment)=>{
        if(String(comment.id) === String(parentComment.id)) {
            return {...parentComment, replies}
      }
      return comment
      }))
        }
      } catch(err) {
        console.log(err.message)
      }
    }
    return (
      <>
        <div className="comment">
        <Button id={id} score={score}/>
        <div className="comment__content">
          <img className="avatar" src={user.image.png} />
          <p className="avatar__name">{user.username}
            {String(currentUser.username)===String(user.username) && 
            <span className='avatar__note'>you</span>}</p>
          <p className="time__created">{createdAt}</p>
          {!isOpenEdit?<p className="comment__text">
            {replyingTo !== null && <span className='reply__name'>{`@${replyingTo} `}</span>}
            {content}</p>:<form className='comment__edit' onSubmit={onEditSubmit}><textarea className='comment__textarea' ref={editTextRef}
            defaultValue={content}></textarea><button className='send'type="submit">UPDATE</button></form>}
          {user.username!==currentUser.username?<button className='button__reply' onClick={()=>setOpenReply((prev)=>!prev)}>
          <img src={"images/icon-reply.svg"} alt="" /> Reply</button>:<div className='button__reply'><button className='button__delete' onClick={() => deleteTextRef.current.showModal()}>
          <img src={"images/icon-delete.svg"} alt="" /> Delete</button><button className='button__edit' onClick={()=>setOpenEdit((prev)=>!prev)}>
          <img src={"images/icon-edit.svg"} alt=""/> Edit</button></div>}
          </div>
      </div>
      {isOpenReply && <form className='reply__content' onSubmit={onSubmit}>
              <img className='reply__avatar' src={currentUser.image.png}/>
              <textarea className='reply__add' placeholder='Add a reply...' ref={replyTextRef}></textarea>
              <button className='send'type="submit">Reply</button>
          </form>}
          <dialog ref={deleteTextRef} className='popup'>
            <p className='popup__question'>Are you sure that you want delete the comment?</p>
            <div><button className='popup__cansel popup__button' onClick={()=>deleteTextRef.current.close()}>Cansel</button>
            <button className='popup__agree popup__button' onClick={onClickDelete}>Yes</button></div>
          </dialog>
          </>
    )
}