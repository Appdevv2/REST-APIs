import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

const SinglePost = () => {
  const { postId } = useParams();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!postId) return;

    fetch(`http://localhost:3005/feed/posts/${postId}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch status");
        }
        return res.json();
      })
      .then((resData) => {
        setTitle(resData.post.title);
        setAuthor(resData.post.creator.name);
        setImage("http://localhost:3005/" + resData.post.imageUrl);
        setDate(new Date(resData.post.createdAt).toLocaleDateString("en-US"));
        setContent(resData.post.content);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [postId]);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
};

export default SinglePost;
