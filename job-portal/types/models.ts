import { Timestamp } from "firebase/firestore";

export interface user {
    userId : string ,
    name: string,
     email: string ,
     city: string ,
     role: string ,
      education: string,
       age :number ,
       phoneNumber: string , 
       cnic: string , 
       dob : Timestamp ,
        createdAt : Timestamp,
}
export interface job {
     jobsId : string ,
      employerId : string , 
      title : string ,
       description : string , 
       companyName : string , 
    location : string ,
    jobType : string ,
        workMode: string ,
         experienceLevel : string ,
          salaryMin :number ,
          salaryMax : number ,
          skills : string[] ,
           category: string ,
            deadline: Timestamp , 
            status:string ,
             createdAt : Timestamp ,
             updatedAt : Timestamp,
}

export interface Application {
     id : string ,
      jobId : string,
       userId : string,
        resume : string  ,
         coverLetter : string ,
         status : string ,
         AppliedAt : Timestamp

}