export default function Gallery() {
  return <div className="bg-gray-100">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-items-center gap-4 p-4">
        {gallery.map((expression) => <Art expression={expression} key={expression} dynamic={false} />)}
      </div>
    </div>
}
