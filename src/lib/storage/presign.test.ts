import { describe, expect, it } from "vitest";
import { bucketFromEnv, presignGet, scanKey } from "./presign";

// AWS's published SigV4 query-auth example (s3 GET examplebucket/test.txt, 2013-05-24).
const AWS_EXAMPLE = {
  endpoint: "https://s3.amazonaws.com",
  bucket: "examplebucket",
  region: "us-east-1",
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
};

describe("presignGet", () => {
  it("matches the AWS SigV4 query-string example", () => {
    const url = presignGet(AWS_EXAMPLE, "test.txt", 86400, new Date("2013-05-24T00:00:00Z"));
    expect(url).toContain("https://examplebucket.s3.amazonaws.com/test.txt?");
    expect(url).toContain("X-Amz-Expires=86400");
    expect(url).toMatch(/X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404$/);
  });

  it("caps the lifetime at seven days", () => {
    expect(presignGet(AWS_EXAMPLE, "a.webp", 10 ** 9)).toContain("X-Amz-Expires=604800");
  });
});

describe("scanKey", () => {
  it("accepts catalogue scan assets only", () => {
    expect(scanKey(["1977", "1977-1977-seiko-v1", "pages", "p008.webp"])).toBe("catalogue/1977/1977-1977-seiko-v1/pages/p008.webp");
    expect(scanKey(["1977", "x", "watches", "sm", "p001-01-85071.webp"])).toBe("catalogue/1977/x/watches/sm/p001-01-85071.webp");
    expect(scanKey(["..", "etc", "passwd"])).toBeNull();
    expect(scanKey(["1977", "x", "pages", "p008.png"])).toBeNull();
  });
});

describe("bucketFromEnv", () => {
  it("is null until the bucket is configured", () => {
    expect(bucketFromEnv({} as NodeJS.ProcessEnv)).toBeNull();
  });
});
