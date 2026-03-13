/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // Your code here
  if (!Array.isArray(candidates)) throw new Error("Candidates must be an array");

  const votes = {};
  const registeredVoters = new Set();
  const votedVoters = new Set();
  const candidateMap = new Map();

  candidates.forEach((cand) => {
    if (cand && typeof cand.id === "string") {
      votes[cand.id] = 0;
      candidateMap.set(cand.id, cand);
    }
  });

  return {
    registerVoter(voter) {
      if (
        !voter ||
        typeof voter.id !== "string" ||
        typeof voter.name !== "string" ||
        typeof voter.age !== "number" ||
        voter.age < 18 ||
        registeredVoters.has(voter.id)
      ) {
        return false;
      }
      registeredVoters.add(voter.id);
      return true;
    },

    castVote(voterId, candidateId, onSuccess, onError) {
      if (!registeredVoters.has(voterId)) {
        return typeof onError === 'function' ? onError('Voter not registered') : undefined;
      }
      if (!candidateMap.has(candidateId)) {
        return typeof onError === 'function' ? onError('Candidate not found') : undefined;
      }
      if (votedVoters.has(voterId)) {
        return typeof onError === 'function' ? onError('Voter has already voted') : undefined;
      }
      // record vote
      votes[candidateId] = (votes[candidateId] || 0) + 1;
      votedVoters.add(voterId);
      return typeof onSuccess === 'function' ? onSuccess({ voterId, candidateId }) : undefined;
    },

    getResults(sortFn) {
      const results = candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party,
        votes: votes[c.id] || 0,
      }));
      if (typeof sortFn === 'function') {
        return results.slice().sort(sortFn);
      }
      return results.slice().sort((a, b) => b.votes - a.votes);
    },

    getWinner() {
      // determine if any votes cast
      const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);
      if (totalVotes === 0) return null;

      let winner = null;
      let maxVotes = -1;
      for (const c of candidates) {
        const v = votes[c.id] || 0;
        if (v > maxVotes) {
          maxVotes = v;
          winner = c;
        }
      }
      return winner;
    },
  };
}

export function createVoteValidator(rules) {
  // Your code here
  const { minAge = 18, requiredFields = [] } = rules || {};
  return function validateVoter(voter) {
    if (typeof voter !== "object" || voter === null) {
      return { valid: false, reason: "Invalid voter object" };
    }
    if (voter.age < minAge) {
      return { valid: false, reason: `Voter must be at least ${minAge} years old` };
    }
    for (const field of requiredFields) {
      if (!(field in voter)) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }
    return { valid: true, reason: null };
  };
}


export function countVotesInRegions(regionTree) {
  // Your code here
  if (typeof regionTree !== "object" || regionTree === null) return 0;
  const { votes = 0, subRegions = [] } = regionTree;
  if (!Array.isArray(subRegions)) return votes;
  return votes + subRegions.reduce((sum, sub) => sum + countVotesInRegions(sub), 0);
}

export function tallyPure(currentTally, candidateId) {
  // Your code here
  if (typeof currentTally !== "object" || currentTally === null) return { [candidateId]: 1 };
  return {
    ...currentTally,
    [candidateId]: (currentTally[candidateId] || 0) + 1
  };
}
