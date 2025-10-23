import SearchComponent from "../../components/SearchComponent"

export default function Search() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Tìm kiếm thông tin</h1>
                <SearchComponent />
            </div>
        </main>
    )
}
