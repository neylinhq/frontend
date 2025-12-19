import { cn } from '@/shared/lib/cn'

interface NeylinSymbolProps {
  className?: string
}

export const NeylinSymbol = ({ className }: NeylinSymbolProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M7.50562 9.50819L25.0337 6.88524" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      <path d="M25.0337 6.88524L18.2921 25.2459" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      <path d="M18.2921 25.2459L7.50562 9.50819" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      <path d="M7.50586 6.59834C9.17885 6.59847 10.5107 7.91448 10.5107 9.5085C10.5106 11.1024 9.17873 12.4176 7.50586 12.4177C5.83287 12.4177 4.50018 11.1024 4.5 9.5085C4.5 7.91441 5.83276 6.59834 7.50586 6.59834Z" fill="currentColor" stroke="currentColor"/>
      <path d="M25.0332 4.5C26.4083 4.5 27.4998 5.58061 27.5 6.88477C27.5 8.18913 26.4085 9.27051 25.0332 9.27051C23.6582 9.27026 22.5674 8.18899 22.5674 6.88477C22.5677 5.58076 23.6584 4.50025 25.0332 4.5Z" fill="currentColor" stroke="currentColor"/>
      <path d="M18.2917 22.9918C19.5924 22.9918 20.6236 24.0139 20.6237 25.2457C20.6237 26.4777 19.5925 27.4996 18.2917 27.4996C16.9911 27.4994 15.9607 26.4775 15.9607 25.2457C15.9608 24.014 16.9912 22.992 18.2917 22.9918Z" fill="currentColor" stroke="currentColor"/>
    </svg>
  )
}
