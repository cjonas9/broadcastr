/* 
Heading.tsx:Wrapper component for stylized headings 
-------------------------------------------------
EXAMPLE USAGE:
<Heading level={1}>Heading 1</Heading>
<Heading level={1} serif={false}>This is a sans serifheading</Heading>
*/

type HeadingProps = {
  children: React.ReactNode;
  className?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  serif?: boolean;
};

const sizeMap: Record<HeadingProps["level"], string> = {
  1: "text-5xl",
  2: "text-4xl",
  3: "text-3xl",
  4: "text-xl",
  5: "text-lg",
  6: "text-base",
};

const mbMap: Record<HeadingProps["level"], string> = {
  1: "mb-3",
  2: "mb-2",
  3: "mb-2",
  4: "mb-1",
  5: "",
  6: "",
};

const mtMap: Record<HeadingProps["level"], string> = {
  1: "mt-10",
  2: "mt-6",
  3: "mt-4",
  4: "mt-3",
  5: "mt-2",
  6: "mt-1",
};

export const Heading = ({
  children,
  className = "",
  level = 1,
  serif = true,
}: HeadingProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const size = sizeMap[level];
  const mb = mbMap[level];
  const mt = mtMap[level];
  const fontClass = serif ? "font-heading" : "";
  
  return (
    <Tag className={`${fontClass} ${mt} ${mb} ${size} ${className}`}>
      {children}
    </Tag>
  );
};