"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { SearchState } from "../types/search"
import searchAction from "./actions/search"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            disabled={pending}
            className="py-2 utline-transparent px-4 hover:bg-blue-400 hover:text-black border border-transparent rounded-2xl hover:border-black"
        >
            {pending ? "Searching..." : "Search"}
        </button>
    )
}

function LoadingIndicator() {
    const { pending } = useFormStatus()
    if (!pending) return null
    return (
        <div className="mt-2 text-xs text-neutral-400 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Searching...
        </div>
    )
}

const initialState: SearchState = { results: [], summary: "", sources: [], msg: "" }

export default function Home() {
    const [state, formAction] = useActionState(searchAction, initialState)

    const hasSearched =
        state.msg !== "" ||
        state.results.length > 0 ||
        state.summary !== "" ||
        state.sources.length > 0

    const isError = !!state.msg && /status|failed|error/i.test(state.msg)
    const noResults =
        hasSearched && !isError && state.results.length === 0 && state.msg === "No match found"

    return (
        <div className="flex min-h-screen relative items-center justify-center bg-zinc-50 font-sans dark:bg-black overflow-hidden">
            {/* decorative blobs */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 flex justify-center gap-8 w-[42rem] max-w-none sm:w-[52rem] md:w-[62rem]"
            >
                <div className="bg-cyan-700/15 aspect-square rounded-full blur-[6rem] w-[18rem] sm:w-[22rem] md:w-[26rem] shrink-0" />
                <div className="bg-cyan-400/15 aspect-square rounded-full blur-[6rem] w-[18rem] sm:w-[22rem] md:w-[26rem] shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-6 w-full px-4">
                {/* search input container */}
                <div className="flex-shrink-0 w-full max-w-xl bg-netural-400/20 hover:bg-netural-400/30 text-neutral-300 rounded-3xl px-4 py-4 backdrop-blur-md border border-neutral-400/20 ">
                    <form action={formAction} className="flex gap-2">
                        <input
                            placeholder="Enter query"
                            name="query"
                            className="flex-1 outline-none py-2 bg-transparent min-w-0"
                            autoComplete="off"
                        />
                        <SubmitButton />
                    </form>
                    <LoadingIndicator />
                </div>

                {/* info helper */}
                {!hasSearched && (
                    <p className="text-neutral-400 text-sm max-w-xl w-full text-center">
                        Type a query and search.
                    </p>
                )}

                {/* error box */}
                {isError && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 w-full max-w-xl">
                        {state.msg}
                    </div>
                )}

                {/* no results box */}
                {noResults && (
                    <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 w-full max-w-xl">
                        No results found.
                    </div>
                )}

                {/* results container */}
                {state.results.length > 0 && (
                    <div className="text-sm mt-2 w-full max-w-2xl bg-netural-400/20 hover:bg-netural-400/30 text-neutral-300 rounded-3xl px-5 py-4 backdrop-blur-md border border-neutral-400/20">
                        {/* search results */}
                        <ul className="ml-0 gap-4 mt-1 flex flex-col">
                            {state.results.map(r => (
                                <li key={r.id} className="list-none relative">
                                    {r.score !== undefined && (
                                        <span className="absolute top-0 right-0 bg-green-400 text-neutral-800 text-xs font-semibold rounded px-2 py-0.5">
                                            score: {r.score}
                                        </span>
                                    )}
                                    <p className="text-lg text-neutral-100 font-medium pr-24 break-words">
                                        {r.title}
                                    </p>
                                    <p className="text-sm text-neutral-300/70 leading-snug break-words">
                                        {r.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        {/* summary of search results */}
                        {state.summary && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-neutral-100 mb-1">Summary</h3>
                                <p className="text-neutral-300/70 text-sm break-words">{state.summary}</p>
                            </div>
                        )}
                        {/* sources section */}
                        {state.sources.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-neutral-100 mb-1">Sources</h3>
                                <p className="text-neutral-300/70 text-sm break-words">
                                    {state.sources.join(", ")}
                                </p>
                            </div>
                        )}
                        {/* no match found error */}
                        {state.msg && !isError && state.msg !== "No match found" && (
                            <p className="mt-4 text-xs text-neutral-500 break-words">{state.msg}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
