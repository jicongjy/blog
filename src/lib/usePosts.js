import { useEffect, useState } from 'react'
import { listPosts } from '../data/posts.js'
import { useAuth } from './auth.jsx'

// 목록과 사이드바가 함께 쓰는 글 목록. 번호(No.)는 오래된 글이 01이다.
export function usePosts() {
  const { isAdmin } = useAuth()
  const [posts, setPosts] = useState(null)
  useEffect(() => {
    listPosts({ isAdmin }).then(setPosts)
  }, [isAdmin])
  return posts
}
