import React from "react";

const Page = ({ params }: { params: { slug: string } }) => {
  return <div>Proyecto: {params.slug}</div>;
};

export default Page;
