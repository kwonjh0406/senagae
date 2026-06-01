"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { makeNickname } from "@/lib/community/nickname";

type Comment = {
  content: string;
  createdAt: string;
  id: string;
  nickname: string;
};

type Post = {
  comments: Comment[];
  content: string;
  createdAt: string;
  id: string;
  nickname: string;
  title: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function readMessage(response: Response) {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : "요청 처리에 실패했습니다.";
}

export function CommunityClient({ initialNickname }: { initialNickname: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [openCommentFormId, setOpenCommentFormId] = useState<string | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [postForm, setPostForm] = useState({
    content: "",
    nickname: initialNickname,
    password: "",
    title: "",
  });
  const [commentForms, setCommentForms] = useState<Record<string, { content: string; nickname: string; password: string }>>(
    {},
  );
  const [deletePasswords, setDeletePasswords] = useState<Record<string, string>>({});

  const emptyText = useMemo(
    () => (isLoading ? "게시글을 불러오는 중입니다." : "아직 글이 없습니다. 첫 글을 남겨주세요."),
    [isLoading],
  );

  async function loadPosts() {
    setIsLoading(true);
    const response = await fetch("/api/community/posts", { cache: "no-store" });

    if (!response.ok) {
      setMessage(await readMessage(response));
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as { posts: Post[] };
    setPosts(data.posts);
    setCommentForms((current) => {
      const next = { ...current };
      data.posts.forEach((post) => {
        next[post.id] ??= { content: "", nickname: makeNickname(), password: "" };
      });
      return next;
    });
    setIsLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function getCommentForm(postId: string) {
    return commentForms[postId] ?? { content: "", nickname: makeNickname(), password: "" };
  }

  function updateCommentForm(postId: string, value: Partial<{ content: string; nickname: string; password: string }>) {
    setCommentForms((current) => ({
      ...current,
      [postId]: {
        ...getCommentForm(postId),
        ...value,
      },
    }));
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/community/posts", {
      body: JSON.stringify(postForm),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setMessage(await readMessage(response));
      return;
    }

    setPostForm({ content: "", nickname: makeNickname(), password: "", title: "" });
    setIsComposerOpen(false);
    setExpandedPostId(null);
    setMessage("글이 등록되었습니다.");
    await loadPosts();
  }

  async function createComment(postId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = getCommentForm(postId);
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setMessage(await readMessage(response));
      return;
    }

    setCommentForms((current) => ({
      ...current,
      [postId]: { content: "", nickname: makeNickname(), password: "" },
    }));
    setOpenCommentFormId(null);
    setMessage("댓글이 등록되었습니다.");
    await loadPosts();
  }

  async function deletePost(postId: string) {
    setMessage("");
    const response = await fetch(`/api/community/posts/${postId}`, {
      body: JSON.stringify({ password: deletePasswords[`post-${postId}`] ?? "" }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage(await readMessage(response));
      return;
    }

    setOpenPostMenuId(null);
    setMessage("글이 삭제되었습니다.");
    await loadPosts();
  }

  async function deleteComment(commentId: string) {
    setMessage("");
    const response = await fetch(`/api/community/comments/${commentId}`, {
      body: JSON.stringify({ password: deletePasswords[`comment-${commentId}`] ?? "" }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage(await readMessage(response));
      return;
    }

    setOpenCommentMenuId(null);
    setMessage("댓글이 삭제되었습니다.");
    await loadPosts();
  }

  return (
    <section className="community-shell">
      <div className="community-toolbar">
        <div>
          <strong>개미 게시판</strong>
          <span>전체 {posts.length}개 글</span>
        </div>
        <button type="button" onClick={() => setIsComposerOpen((open) => !open)}>
          {isComposerOpen ? "닫기" : "글쓰기"}
        </button>
      </div>

      {isComposerOpen ? (
        <form className="community-composer" onSubmit={createPost}>
          <div className="board-title">
            <span>글쓰기</span>
          </div>
          <label>
            닉네임
            <input
              value={postForm.nickname}
              onChange={(event) => setPostForm({ ...postForm, nickname: event.target.value })}
            />
          </label>
          <label>
            임시 비밀번호
            <input
              minLength={4}
              type="password"
              value={postForm.password}
              onChange={(event) => setPostForm({ ...postForm, password: event.target.value })}
            />
          </label>
          <label className="wide-field">
            제목
            <input
              value={postForm.title}
              onChange={(event) => setPostForm({ ...postForm, title: event.target.value })}
            />
          </label>
          <label className="wide-field">
            내용
            <textarea
              rows={6}
              value={postForm.content}
              onChange={(event) => setPostForm({ ...postForm, content: event.target.value })}
            />
          </label>
          <button type="submit">글 등록</button>
        </form>
      ) : null}

      {message ? <p className="community-message">{message}</p> : null}

      <div className="community-list">
        {posts.length === 0 ? <p className="empty-board">{emptyText}</p> : null}
        {posts.map((post) => {
          const commentForm = getCommentForm(post.id);
          const isExpanded = expandedPostId === post.id;
          const isPostMenuOpen = openPostMenuId === post.id;
          const isCommentFormOpen = openCommentFormId === post.id;
          return (
            <article className="community-post" key={post.id}>
              <header>
                <div>
                  <span>{post.nickname}</span>
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                  <em>댓글 {post.comments.length}</em>
                </div>
                <button
                  aria-expanded={isExpanded}
                  className="post-title-button"
                  type="button"
                  onClick={() => {
                    setExpandedPostId((current) => (current === post.id ? null : post.id));
                    setOpenPostMenuId(null);
                    setOpenCommentFormId(null);
                    setOpenCommentMenuId(null);
                  }}
                >
                  {post.title}
                </button>
              </header>

              {isExpanded ? (
                <div className="post-expanded-panel">
                  <p>{post.content}</p>
                  <div className="post-action-row">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCommentFormId((current) => (current === post.id ? null : post.id));
                        setOpenPostMenuId(null);
                      }}
                    >
                      {isCommentFormOpen ? "댓글 닫기" : "댓글 작성"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenPostMenuId((current) => (current === post.id ? null : post.id));
                        setOpenCommentFormId(null);
                      }}
                    >
                      더보기
                    </button>
                  </div>

                  {isPostMenuOpen ? (
                    <div className="delete-row">
                      <input
                        placeholder="글 비밀번호"
                        type="password"
                        value={deletePasswords[`post-${post.id}`] ?? ""}
                        onChange={(event) =>
                          setDeletePasswords((current) => ({
                            ...current,
                            [`post-${post.id}`]: event.target.value,
                          }))
                        }
                      />
                      <button type="button" onClick={() => void deletePost(post.id)}>
                        글 삭제
                      </button>
                    </div>
                  ) : null}

                  <section className="comment-box" aria-label={`${post.title} 댓글`}>
                    <h3>댓글 {post.comments.length}</h3>
                    {post.comments.map((comment) => {
                      const isCommentMenuOpen = openCommentMenuId === comment.id;
                      return (
                        <div className="comment-item" key={comment.id}>
                          <div>
                            <strong>{comment.nickname}</strong>
                            <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCommentMenuId((current) =>
                                  current === comment.id ? null : comment.id,
                                )
                              }
                            >
                              삭제
                            </button>
                          </div>
                          <p>{comment.content}</p>
                          {isCommentMenuOpen ? (
                            <div className="delete-row compact">
                              <input
                                placeholder="댓글 비밀번호"
                                type="password"
                                value={deletePasswords[`comment-${comment.id}`] ?? ""}
                                onChange={(event) =>
                                  setDeletePasswords((current) => ({
                                    ...current,
                                    [`comment-${comment.id}`]: event.target.value,
                                  }))
                                }
                              />
                              <button type="button" onClick={() => void deleteComment(comment.id)}>
                                확인
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    {isCommentFormOpen ? (
                      <form
                        className="comment-form"
                        onSubmit={(event) => void createComment(post.id, event)}
                      >
                        <input
                          aria-label="댓글 닉네임"
                          value={commentForm.nickname}
                          onChange={(event) => updateCommentForm(post.id, { nickname: event.target.value })}
                        />
                        <input
                          aria-label="댓글 임시 비밀번호"
                          placeholder="비밀번호"
                          type="password"
                          value={commentForm.password}
                          onChange={(event) => updateCommentForm(post.id, { password: event.target.value })}
                        />
                        <textarea
                          aria-label="댓글 내용"
                          placeholder="댓글을 남겨주세요"
                          rows={3}
                          value={commentForm.content}
                          onChange={(event) => updateCommentForm(post.id, { content: event.target.value })}
                        />
                        <button type="submit">댓글 등록</button>
                      </form>
                    ) : null}
                  </section>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
