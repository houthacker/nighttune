
export type JobStatus = 'submitted' | 'processing' | 'error' | 'success' 
export type JobId = string

export type Job = {
    id: JobId
    status: JobStatus
    submittedAt: any
}

export type AutotuneOptions = {
    readonly jobId: JobId
    readonly nsHost: string
    readonly dateFrom: string
    readonly dateTo: string
    readonly uam: boolean
    readonly autotuneVersion: string
    readonly timeZone: string
    readonly basalIncrement: number
}

export enum RecommendationType {
    ISF = 'ISF',
    CR = 'CR',
    BASAL = 'BASAL'
}

export type Recommendation = {
    readonly type: RecommendationType
    readonly currentValue: number
    readonly recommendedValue: number
}

export type BasalRecommendation = Recommendation & {
    when: string
    daysMissing: number
    roundedRecommendation: number
}

export class AutotuneResult {
    public readonly options: AutotuneOptions

    public readonly recommendations: Array<Recommendation>

    constructor(options: AutotuneOptions, recommendations: Array<Recommendation>) {
        this.options = options
        this.recommendations = recommendations
    }

    /**
     * Finds the Insuline Sensivitiy Factor recommendation.
     * @returns The ISF recommendation, or `{}` if no such recommendation exists.
     */
    find_isf(): Recommendation {
        let filtered = this.recommendations.filter(r => r.type == RecommendationType.ISF);
        return filtered[0] || {};
    }

    /**
     * Finds the Carb Ratio recommendation.
     * @returns The CR recommendation, or `{}` if not such recommendation exists.
     */
    find_cr(): Recommendation {
        let filtered = this.recommendations.filter(r => r.type == RecommendationType.CR);
        return filtered[0] || {};
    }

    /**
     * 
     * Finds all basal recommendations.
     * @return The basal recommendations.
     */
    find_basal(): BasalRecommendation[] {
        return this.recommendations.filter(r => r.type == RecommendationType.BASAL) as BasalRecommendation[];
    }
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
    return body.result ? new AutotuneResult(body.result.options, body.result.recommendations) : undefined
}
