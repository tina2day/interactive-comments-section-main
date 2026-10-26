
import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
export default function Button(props) {
    const {id, score} = props
    const {currentUser, setCurrentUser, comments, setComments} = useContext(AppContext)
    
    const votes = [...currentUser.votes]
    const vote = votes.find((vote)=>String(vote.commentId)===String(id))
    let active = 0b11;
    if(vote === undefined) {
        active = 0b00
    } else if(Number(vote.value) === -1) {
        active = 0b01
    } else if(Number(vote.value) === 1) {
        active = 0b10
    }

    const [count, setCount] = useState(score)
    async function handleScore(parentComment) {
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
    }
    async function handleVote(currentUser) {
        const response = await fetch("https://6adfb8f08e42963c8d5e5114.mockapi.io/currentUser/1", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(currentUser)
        })
        if(!response.ok) {
            throw new Error(response.status)
        }
    }
    async function onClickplus() {
        const oldVote = vote?.value ?? 0
        const newVote = Math.min(oldVote + 1, 1)
        const allComments = structuredClone(comments)
        const parentComment = allComments.find(comment =>
            String(comment.id) === String(id) ||
            comment.replies.some(reply => String(reply.id) === String(id))
            )
        const otherVotes = votes.filter(
        ({ commentId }) => String(commentId) !== String(id)
        )
        const newVotes = newVote === 0
        ? otherVotes
        : [...otherVotes, { commentId: String(id), value: 1 }]
        const newUser = {...currentUser, votes: newVotes}
        const targetComment =
        String(parentComment.id) === String(id)
            ? parentComment
            : parentComment.replies.find(reply => String(reply.id) === String(id))

        targetComment.score = Number(targetComment.score) + (newVote - oldVote)
        try{
            await Promise.all([
                handleVote(newUser),
                handleScore(parentComment),
                ])
            setCurrentUser(newUser)
            setCount((prev)=> prev-oldVote+newVote)
            setComments(allComments)
        }catch(err){
            console.log(err.message)
        }
    }
    async function onClickminus() {
        const oldVote = vote?.value ?? 0
        const newVote = Math.max(oldVote - 1, -1)
        const allComments = structuredClone(comments)
        const parentComment = allComments.find(comment =>
            String(comment.id) === String(id) ||
            comment.replies.some(reply => String(reply.id) === String(id))
            )
        const otherVotes = votes.filter(({commentId}) => String(commentId) !== String(id))
        const newVotes = newVote === 0? otherVotes:[...otherVotes,{commentId: String(id), value: -1}]
        const newUser = {...currentUser, votes: newVotes}
        const targetComment =
        String(parentComment.id) === String(id)
            ? parentComment
            : parentComment.replies.find(reply => String(reply.id) === String(id))

        targetComment.score = Number(targetComment.score) + (newVote - oldVote)
        try{
            await Promise.all([
            handleVote(newUser),
            handleScore(parentComment),
            ])
            setCurrentUser(newUser)
            setCount((prev)=> prev-oldVote+newVote)
            setComments(allComments)
        }catch(err){
            console.log(err.message)
        } 
    }
    
    return (
        <div className="button">
          <button className="button__plus" onClick={onClickplus} disabled={(active&0b10) !== 0}>+</button>
          <p className="score">{count}</p>
          <button className="button__minus" onClick={onClickminus} disabled={(active&0b01) !== 0}>−</button>
        </div>
    )
}