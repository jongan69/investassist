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

    const indexOfLastArticle = currentPage * articlesPerPage
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage

    const newCurrentNews = newsItems.slice(indexOfFirstArticle, indexOfLastArticle)
    setCurrentNews(newCurrentNews)
  }, [currentPage, newsItems])

  const totalPages = Math.ceil(newsItems.length / articlesPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
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
            handlePreviousPage()
          }}
          disabled={currentPage === 1}
          className="text-sm font-medium text-blue-500 disabled:text-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => {
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