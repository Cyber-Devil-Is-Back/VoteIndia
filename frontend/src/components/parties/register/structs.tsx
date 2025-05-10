export interface PartyDetails {
    partyname: string;
    partyabbr: string;
    logo: File | null;
    slogan: string;
    date: string;
    partytype: string;
    state: string;
    desc: string;
}
  
export interface PartyContactAndLeaderDetails {
    email: string;
    password: string;
    confirmPassword: string;
    website: string;
    phone: string;
    leadername: string;
    foundername: string;
    manifesto: string;
    image: File | null;
}
  