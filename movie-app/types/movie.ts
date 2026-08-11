export interface Movie{
    id: number,
    title:string,
    poster_path:string | null ,
    relaase_date:string,
    vote_avearge:number,
    overview:string,
}

export interface MovieResponse{
    page:number,
    results:Movie[],
    total_page:number,
    total_result:number,
}