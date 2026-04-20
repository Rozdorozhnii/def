import type { NoteOriginal } from "@contracts/notes";

interface Props {
  original: NoteOriginal;
}

export function OriginalReadOnly({ original }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center min-h-[36px]">
        <h2 className="text-lg font-semibold">Ukrainian (original)</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">Title</p>
          <p className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] text-sm bg-gray-50">
            {original.title}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">Description</p>
          <p className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] text-sm bg-gray-50">
            {original.description}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">Body</p>
          <div
            className="border border-[#dfdbd8] rounded-lg p-4 prose max-w-none text-sm bg-gray-50 min-h-64"
            dangerouslySetInnerHTML={{ __html: original.body }}
          />
        </div>
      </div>
    </section>
  );
}
