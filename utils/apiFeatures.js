class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filtering() {
    const queryStringObject = { ...this.queryString };
    const excludedFields = ["sort", "keyword", "limit", "page", "fields"];
    excludedFields.forEach((field) => delete queryStringObject[field]);

    let queryStr = JSON.stringify(queryStringObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    let pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.previous = page - 1;

    this.paginationResult = pagination;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }

  search() {
    if (this.queryString.keyword) {
      let query = {};
      query.$or = [
        {
          description: { $regex: this.queryString.keyword, $options: "i" },
        },
      ];
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
}

module.exports = ApiFeatures;
