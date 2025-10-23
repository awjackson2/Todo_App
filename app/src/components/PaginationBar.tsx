import React from 'react';
import { Pagination } from 'react-bootstrap';

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export default function PaginationBar({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;
  const items: React.ReactNode[] = [];
  const max = pageCount;
  let lastWasEllipsis = false;
  for (let p = 1; p <= max; p++) {
    if (p === 1 || p === max || Math.abs(p - page) <= 1) {
      items.push(<Pagination.Item key={p} active={p === page} onClick={() => onChange(p)}>{p}</Pagination.Item>);
      lastWasEllipsis = false;
    } else if (!lastWasEllipsis) {
      items.push(<Pagination.Ellipsis key={`e${p}`} disabled />);
      lastWasEllipsis = true;
    }
  }

  return (
    <Pagination size="sm" className="mt-3 justify-content-center flex-wrap">
      <Pagination.Prev 
        disabled={page === 1} 
        onClick={() => onChange(page - 1)}
        className="border-0"
        title="Previous page"
      />
      <div className="d-flex flex-wrap justify-content-center gap-1">
        {items}
      </div>
      <Pagination.Next 
        disabled={page === pageCount} 
        onClick={() => onChange(page + 1)}
        className="border-0"
        title="Next page"
      />
    </Pagination>
  );
}


