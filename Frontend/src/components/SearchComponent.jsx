import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent } from "../components/ui/Card"
import { Search, Loader2 } from "lucide-react"
import { searchResults } from "../services/searchService"
export default function SearchComponent() {
    const [question, setQuestion] = useState("")
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async () => {
        if (!question.trim()) return

        setIsLoading(true)
        try {
            // console.log("query", question)
            const response = await searchResults(question.trim());
            // console.log(response)
            setResults(response || [])
        } catch (error) {
            console.error("Search error:", error)
            setResults([
                {
                    question: question,
                    answer: "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.",
                    similarity: 0,
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex gap-3">
                <Input
                    type="text"
                    placeholder="Nhập câu hỏi của bạn..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-12 text-base"
                    disabled={isLoading}
                />
                <Button
                    onClick={handleSearch}
                    disabled={isLoading || !question.trim()}
                    className="px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Đang tìm...
                        </>
                    ) : (
                        <>
                            Tìm kiếm
                        </>
                    )}
                </Button>
            </div>

            {results.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Kết quả tìm kiếm ({results.length} kết quả):
                    </h3>
                    <div className="space-y-4">
                        {results.map((result, index) => {
                            // Parse content JSON
                            let answerText = ""
                            try {
                                const contentObj = JSON.parse(result.content)
                                // Lấy tất cả value của object nối thành 1 chuỗi
                                answerText = Object.values(contentObj).join("\n")
                            } catch (e) {
                                answerText = result.content
                            }

                            return (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Số thứ tự */}
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            
                                            {/* Nội dung */}
                                            <div className="flex-1">
                                                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                        {answerText}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}


            {isLoading && (
                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <span className="text-gray-600 text-lg">Đang tìm kiếm...</span>
                            <span className="text-gray-400 text-sm mt-1">Vui lòng đợi trong giây lát</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isLoading && results.length === 0 && question && (
                <Card className="border border-gray-200">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có kết quả</h3>
                            <p className="text-gray-400">Nhập câu hỏi và nhấn tìm kiếm để xem kết quả</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
