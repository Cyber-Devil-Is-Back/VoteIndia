"use client"
import { useEffect, useState } from "react";

export default function VotePage() {
  const [candidate, setCandidates] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch candidates from API
    fetch("/api/candidates")
      .then((response) => response.json())
      .then((data) => setCandidates(data))
      .catch((error) => console.error("Error fetching candidates:", error));
      setMessage("Welcome to the Voting Page! Please select your candidate.");
      console.log("Candidates fetched successfully:", candidate);
  },[candidate] );

  // const handleVote = async (candidateId) => {
  //   try {
  //     const response = await fetch("/api/vote", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ candidateId }),
  //     });

  //     if (response.ok) {
  //       setMessage("✅ Vote cast successfully!");
  //     } else {
  //       setMessage("❌ Failed to vote. Please try again.");
  //     }
  //   } catch (error) {
  //     setMessage("⚠️ Error: Could not send vote.");
  //   }
  // };

  return (
    <div className="relative flex  justify-center min-h-screen bg-gradient-to-b from-[#FF9933] via-white to-[#138808] p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">🗳️ Vote for Your Candidate</h1>

      {message && (
        <div className="text-center text-green-600 font-semibold mb-4">{message}</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src={candidate.image_url}
              alt={candidate.name}
              className="w-full h-40 object-cover rounded-md"
            />
            <h2 className="text-xl font-semibold mt-2">{candidate.name}</h2>
            <p className="text-gray-600">{candidate.party}</p>
            <button
              onClick={() => handleVote(candidate.id)}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              ✅ Vote
            </button>
          </div>
        ))} */}
      </div>
    </div>
  );
}
