"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { CardFooter } from "@/components/ui/card"

interface NewsItem {
  publisher: string
  link: string
  title: string
}

interface NewsSectionProps {
  news: NewsItem[]
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [newsItems, setNewsItems] = useState<NewsItem[]>(news)
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([])
  const articlesPerPage = 5

  useEffect(() => {
    // console.log('useEffect triggered')
    // console.log('newsItems length:', newsItems.length)
    // console.log('currentPage:', currentPage)
    const indexOfLastArticle = currentPage * articlesPerPage
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage
    // console.log('indexOfFirstArticle:', indexOfFirstArticle)
    // console.log('indexOfLastArticle:', indexOfLastArticle)
    const newCurrentNews = newsItems.slice(indexOfFirstArticle, indexOfLastArticle)
    // console.log('new currentNews:', newCurrentNews)
    setCurrentNews(newCurrentNews)
  }, [currentPage, newsItems])

  const totalPages = Math.ceil(newsItems.length / articlesPerPage)
//   console.log('totalPages:', totalPages)

  const handleNextPage = () => {
    // console.log('handleNextPage clicked')
    // console.log('current page before:', currentPage)
    // console.log('totalPages:', totalPages)
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1
      console.log('setting page to:', nextPage)
      setCurrentPage(nextPage)
    }
  }

  const handlePreviousPage = () => {
    // console.log('handlePreviousPage clicked')
    // console.log('current page before:', currentPage)
    if (currentPage > 1) {
      const prevPage = currentPage - 1
    //   console.log('setting page to:', prevPage)
      setCurrentPage(prevPage)
    }
  }

  return (
    <div>
      {currentNews.map((newsItem, index) => (
        <CardFooter key={index} className="flex-col items-start p-4">
          <p className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-500">
            {newsItem.publisher}
          </p>
          <Link
            prefetch={false}
            href={newsItem.link}
            className="text-lg font-extrabold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {newsItem.title}
          </Link>
        </CardFooter>
      ))}
      <div className="flex justify-between p-4">
        <button
          onClick={() => {
            console.log("Previous button clicked")
            handlePreviousPage()
          }}
          disabled={currentPage === 1}
          className="text-sm font-medium text-blue-500 disabled:text-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => {
            console.log("Next button clicked")
            handleNextPage()
          }}
          disabled={currentPage === totalPages}
          className="text-sm font-medium text-blue-500 disabled:text-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default NewsSection 