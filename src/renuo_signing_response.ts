interface RenuoSigningResponse {
  url: string;
  data: {
    key: string;
    acl: string;
    policy: string;
    x_amz_algorithm: string;
    x_amz_credential: string;
    x_amz_expires: number;
    x_amz_signature: string;
    x_amz_date: string;
    utf8: string;
  };
  file_prefix: string;
  file_url_path: string;
}
