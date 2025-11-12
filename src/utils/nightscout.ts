
export type JobStatus = 'submitted' | 'processing' | 'error' | 'success' 

export type Job = {
    id: string,
    status: JobStatus
    submittedAt: any
}

export type AutotuneOptions = {}
export type Recommendation = {}

export type AutotuneResult = {
    options: AutotuneOptions

    recommendations: Array<Recommendation>
}

export async function fetchJobs(): Promise<Array<Job>> {
    const response = await fetch(new URL('job/all', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
        method: 'GET',
        credentials: 'include',
    })

    const body = await response.json() as { jobs: Array<Job> }
    return body.jobs === undefined ? [] : [...body.jobs]
}

export async function fetchJobResults(id: string): Promise<AutotuneResult | undefined> {
    const response = await fetch(new URL(`job/id/${id}`, process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
        method: 'GET',
        credentials: 'include'
    })

    const body = await response.json() as { result: AutotuneResult | undefined }
    return body.result
}
