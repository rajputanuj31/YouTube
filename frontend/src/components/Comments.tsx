import React, { useEffect, useState } from 'react'
import { getTimeAgo } from "@/app/utils/getTimeAgo"

// Define the prop types
interface Comment {
  _id: string;
  content: string;
  owner: string;
  createdAt: string;
  ownerUsername?: string; // Added optional property for ownerUsername
  ownerAvatar?: string; // Added optional property for ownerAvatar
}

interface CommentsProps {
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  currentUser: { _id: string } | null; // Adjust this type based on your user structure
  videoId: string;
}

const Comments: React.FC<CommentsProps> = ({ setComments, currentUser, videoId }) => {
  const [comment, setComment] = useState("");
  const [comments, setCommentsState] = useState<Comment[]>([]); // Local state for comments

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/v1/comments/get-comments-by-video/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();

        // Fetch each user for their username
        const usersPromises = data.data.comments.map((comment: Comment) => fetch(`/api/v1/users/channel-details/${comment.owner}`));
        const usersResponses = await Promise.all(usersPromises);
        const usersData = await Promise.all(usersResponses.map(response => response.json()));

        const commentsWithUsernames = data.data.comments.map((comment: Comment, index: number) => ({
          ...comment,
          ownerUsername: usersData[index].data.username, // Added @ at username
          ownerAvatar: usersData[index].data.avatar, // Added ownerAvatar
          createdAt: new Date(comment.createdAt), // Added createdAt for comment time
        }));

        setCommentsState(commentsWithUsernames || []); // Ensure comments is set to an empty array if data.data is undefined
        setComments(commentsWithUsernames || []); // Update the parent state as well
      } catch (error) {
        console.error((error as Error).message);
      }
    };

    fetchComments();
  }, [videoId, setComments]);

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!comment || !currentUser?._id) return; // Check if currentUser._id exists

    try {
      const response = await fetch(`/api/v1/comments/add-comment/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment, userId: currentUser._id }), // Changed 'comment' to 'content' to match the API
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      setCommentsState((prevComments) => Array.isArray(prevComments) ? [...prevComments, newComment.data] : [newComment.data]);// Handle case where prevComments might be undefined
      setComments((prevComments) => Array.isArray(prevComments) ? [...prevComments, newComment.data] : [newComment.data]); // Update parent state
      setComment("");
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  return (
    <div className="bg-black p-4 mt-2 rounded-md"> {/* Comments section */}
      <h2 className="text-white text-lg font-bold">Comments ({comments.length})</h2>
      <form onSubmit={handleCommentSubmit} className="mt-2">
        <input
          type="text"
          placeholder="Add Comment"
          value={comment} // Bind the input value to the comment state
          onChange={(e) => setComment(e.target.value)} // Update the comment state on input change
          className="w-full py-2 px-4 rounded-full focus:outline-none border border-gray-800"
          style={{
            background: 'rgba(17, 19, 19, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem rgba(194, 192, 192, 0.10) !important',
            color: '#fff',
            fontSize: '16px',
            height: '4rem',
          }}
        />
        <button type="submit" className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-full ">Comment</button>
      </form>
      <div className="mt-4">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="text-gray-400 text-sm mb-4 flex">
              <img src={c.ownerAvatar} alt={c.ownerUsername} className="w-8 h-8 rounded-full mr-2" /> {/* Added avatar */}
              <div className="flex flex-col">
                <div className="flex items-center">
                  <p className="text-white text-sm font-semibold mr-3">@{c.ownerUsername}</p> {/* Added @ at username */}
                  <p className="text-gray-500 text-xs">{getTimeAgo(c.createdAt)}</p> {/* Added comment time */}
                </div>
                <p className="text-white ml-1">{c.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}

export default Comments
