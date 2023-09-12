class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                //case insensitive
                $options:"i", 
            },
        }
      : {};
      console.log(keyword);

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    // {} is used so that reference is not passed.
    //   Removing some fields for category
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key) => delete queryCopy[key]);

    // Filter For Price and Rating

    let queryStr = JSON.stringify(queryCopy);
    // gt - greater than lt - less than gte-geater than equal to lte-less than equal to
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  pagination(resultPerPage){
    const currentPage   = Number(this.queryStr.page) || 1;
    // for skipping products
    const skip = resultPerPage*(currentPage-1); 
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;