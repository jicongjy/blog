import { useCallback, useEffect, useState } from 'react'
import { listCategories, seedCategories } from '../data/categories.js'
import { useAuth } from './auth.jsx'

// 카테고리 목록(순서대로). 관리자가 처음 열었을 때 비어 있으면 기본 카테고리를 만든다.
export function useCategories() {
  const { isAdmin, ready } = useAuth()
  const [cats, setCats] = useState(null)
  const reload = useCallback(async () => {
    let list = await listCategories().catch(() => [])
    if (list.length === 0 && isAdmin) list = await seedCategories().catch(() => [])
    setCats(list)
  }, [isAdmin])
  useEffect(() => {
    if (ready) reload()
  }, [ready, reload])
  return [cats, reload]
}
