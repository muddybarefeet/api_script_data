
The Brief:

*First 1000 products (product name and product category) offered between August 1 - August 31, 2015
*Historical pricing / all prices that have been recorded for the products and the date recorded for those
*id's
*only have the active products
*url of the product

To run:

Call the product endpoint for the product data

```node pullApiData_1.js *file_path_write_to*```

Then filter the data

```node filterData.js *start_date_filter_string* *end_date_string* *file_path_write_from* *file_path_write_to*```

Then call the offers endpoint for the offers data of the products have

```node addPriceHistories_2.js *file_path_write_to* *file_path_write_from*```

Then copy the contents of the last written file into a csv compiler e.g. [konklone](http://konklone.io/json/)


To be improved:

*line 62 pullAndFilterData_1 - how to tell it to stop looking when there are no more pages to look at. Currently errors out.