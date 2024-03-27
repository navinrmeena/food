"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; //from new version of nextjs
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export default function CalPage() {
  const router = useRouter();

  const [cal, setcal] = React.useState({
    zone: "",
    organization_id: "",
    total_distance: "",
    item_type: "",
  });

  const [buttonDisabled, setButtonDisabled] = React.useState(false);

  useEffect(() => {
    if (
      cal.zone.length > 0 &&
      cal.organization_id.length > 0 &&
      cal.total_distance.length > 0 &&
      cal.item_type.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [cal]);

  const [loading, setLoading] = React.useState(false);

  const onCal = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/cal", cal); //update api
      console.log("calculated Sucess", response.data);
      alert("calculated Sucess");
      router.push("/calculator");
    } catch (error: any) {
      console.log(error);
      NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 m-6 ">
      <h1>{loading ? "loading......" : "cal "}</h1>
      <hr />

      <label htmlFor="zone"> zone </label>
      <input
        className="flex flex-col items-center justify-center rounded-lg p-1   text-black"
        id="zone"
        type="text"
        value={cal.zone}
        onChange={(e) => setcal({ ...cal, zone: e.target.value })}
        placeholder="zone"
      />
      <hr />

      <label htmlFor="organization_id"> organization_id </label>
      <input
        className="flex flex-col items-center justify-center rounded-lg p-1   text-black"
        id="organization_id"
        type="text"
        value={cal.organization_id}
        onChange={(e) => setcal({ ...cal, organization_id: e.target.value })}
        placeholder="organization_id"
      />

      <hr />

      <label htmlFor="total_distance"> total_distance </label>
      <input
        className="flex flex-col items-center justify-center rounded-lg p-1   text-black"
        id="total_distance"
        type="text"
        value={cal.total_distance}
        onChange={(e) => setcal({ ...cal, total_distance: e.target.value })}
        placeholder="total_distance"
      />
      <hr />

      <label htmlFor="item_type"> item_type </label>
      <input
        className="flex flex-col items-center justify-center rounded-lg p-1   text-black"
        id="item_type"
        type="text"
        value={cal.item_type}
        onChange={(e) => setcal({ ...cal, item_type: e.target.value })}
        placeholder="item_type"
      />

      <hr />
      <button
        onClick={onCal}
        className="flex flex-col items-center justify-center rounded-lg  bg-blue-600 text-white py-2 px-2 m-5"
      >
        {buttonDisabled ? "disabled" : "Subbmit"}
      </button>
      {/* <button>
        <Link className="link" type="link " href="/calculator">
          New Data  ?{" "}
        </Link>
      </button> */}
    </div>
  );
}
