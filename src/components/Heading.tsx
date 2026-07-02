import { useLineReveal } from '../hooks/useReveal'

/**
 * Editorial display heading with a per-line masked reveal. Pass text with `\n`
 * to control line breaks; each line rises out of its own clip mask on scroll.
 * `em` marks substrings to italicise in serif (wrap them in *asterisks*).
 */
export function Heading({
  text,
  className = '',
  as = 'h2',
  start,
}: {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  start?: string
}) {
  const ref = useLineReveal<HTMLHeadingElement>(start)
  const Tag = as
  const lines = text.split('\n')

  return (
    <Tag ref={ref} className={`display ${className}`}>
      {lines.map((line, i) => (
        <span className="reveal-line" key={i}>
          <span>{renderEmphasis(line)}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Turns *phrase* into an italic serif emphasis run. */
function renderEmphasis(line: string) {
  if (!line.includes('*')) return line
  const parts = line.split('*')
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="serif-em">
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
