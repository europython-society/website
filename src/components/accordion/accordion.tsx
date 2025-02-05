import { clsx } from "clsx";

export const Accordion = ({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id: string;
}) => {
  return (
    <details className="group mb-4">
      <summary
        aria-expanded="false"
        aria-controls={id}
        className={clsx(
          "cursor-pointer flex justify-between p-2 rounded-md border-t border-b focus:ring-2"
        )}
      >
        <span className="font-semibold">{title}</span>
        <span aria-hidden="true" className="group-open:hidden">+</span>
        <span aria-hidden="true" className="group-open:block hidden">−</span>
      </summary>

      <div id={id} className="pl-4">{children}</div>
    </details>
  );
};
