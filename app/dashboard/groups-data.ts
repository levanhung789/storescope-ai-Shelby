export type Company = {
  companyKey: string;
  companyName: string;
  companyFolder: string;
};

export type RankingGroup = {
  groupKey: string;
  groupName: string;
  groupFolder: string;
  companies?: Company[];
};

export const groups: RankingGroup[] = [
  {
    groupKey: "condiments_oil",
    groupName: "Dầu ăn, nước chấm, gia vị",
    groupFolder: "dau-an-nuoc-cham-gia-vi",
    companies: [
      {
        companyKey: "ajinomoto",
        companyName: "Công ty Ajinomoto Việt Nam",
        companyFolder: "cong-ty-ajinomoto-viet-nam",
      },
      {
        companyKey: "golden_farm",
        companyName: "Công ty Cánh Đồng Vàng (Golden Farm)",
        companyFolder: "cong-ty-canh-dong-vang-golden-farm",
      },
      {
        companyKey: "acecook",
        companyName: "Công ty Cổ phần Acecook Việt Nam",
        companyFolder: "cong-ty-co-phan-acecook-viet-nam",
      },
      {
        companyKey: "lien_thanh",
        companyName: "Công ty Cổ phần Chế biến Thủy hải sản Liên Thành",
        companyFolder: "cong-ty-co-phan-che-bien-thuy-hai-san-lien-thanh",
      },
      {
        companyKey: "afotech",
        companyName: "Công ty Cổ phần Công nghệ thực phẩm Châu Á (AFOTECH)",
        companyFolder: "cong-ty-co-phan-cong-nghe-thuc-pham-chau-a-afotech",
      },
      {
        companyKey: "d_shining",
        companyName: "Công ty Cổ phần D-SHINING",
        companyFolder: "cong-ty-co-phan-d-shining",
      },
      {
        companyKey: "tuong_an",
        companyName: "Công ty Cổ phần Dầu Thực Vật Tường An",
        companyFolder: "cong-ty-co-phan-dau-thuc-vat-tuong-an",
      },
      {
        companyKey: "masan",
        companyName: "Công ty Cổ phần Hàng tiêu dùng Masan",
        companyFolder: "cong-ty-co-phan-hang-tieu-dung-masan",
      },
      {
        companyKey: "cholimex",
        companyName: "Công ty Cổ phần Thực phẩm Cholimex",
        companyFolder: "cong-ty-co-phan-thuc-pham-cholimex",
      },
      {
        companyKey: "calofic",
        companyName: "Công ty TNHH Calofic",
        companyFolder: "cong-ty-tnhh-calofic",
      },
    ],
  },
  {
    groupKey: "dairy",
    groupName: "Sữa và sản phẩm từ sữa",
    groupFolder: "sua-va-san-pham-tu-sua",
    companies: [
      {
        companyKey: "vinamilk",
        companyName: "Công ty CP Sữa Việt Nam",
        companyFolder: "cong-ty-cp-sua-viet-nam",
      },
      {
        companyKey: "th_true_milk",
        companyName: "Công ty CP Sữa TH",
        companyFolder: "cong-ty-cp-sua-th",
      },
      {
        companyKey: "frieslandcampina",
        companyName: "Công ty TNHH FrieslandCampina Việt Nam",
        companyFolder: "cong-ty-tnhh-frieslandcampina-viet-nam",
      },
    ],
  },
  {
    groupKey: "dry_instant",
    groupName: "Thực phẩm khô, đồ ăn liền",
    groupFolder: "thuc-pham-kho-do-an-lien",
    companies: [
      {
        companyKey: "acecook",
        companyName: "Công ty Cổ phần Acecook Việt Nam",
        companyFolder: "cong-ty-co-phan-acecook-viet-nam",
      },
      {
        companyKey: "masan",
        companyName: "Công ty Cổ phần Hàng tiêu dùng Masan",
        companyFolder: "cong-ty-co-phan-hang-tieu-dung-masan",
      },
      {
        companyKey: "uniben",
        companyName: "Công ty Cổ phần Uniben",
        companyFolder: "cong-ty-co-phan-uniben",
      },
    ],
  },
];
