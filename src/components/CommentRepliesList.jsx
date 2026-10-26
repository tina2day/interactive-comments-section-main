import CommentItem from './CommentItem';
export default function CommentRepliesList(props) {
    const {replies} = props
    return (
        <div className="replies">
            {replies.map(({id, content, createdAt, score, user, replyingTo}) => 
            <CommentItem id={id} key={id} content={content} createdAt={createdAt} score={score} user={user} replyingTo={replyingTo}/>)}
        </div>
    )
}