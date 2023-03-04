async function getSpaces(address) {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      query: `query ($address: String!) {
        follows(
          first: 10,
          where: {
            follower: $address,
          }
        ) {
          follower
          space {
            id
          }
          created
        }
      }`, variables: {"address": address}
    })
  })
  return response.json()
}

async function getProposals(address) {
  const res = await getSpaces(address);
  const len = res.data.follows.length;
  if(len == 0) return;
  var proposals = [];
  for(let i=0; i<len; i++) {
    proposals.push(res.data.follows[i].space.id);
  }
    const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',

    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `query ($prop: [String!]) {
        proposals (
          first: 20,
          skip: 0,
          where: {
            space_in: $prop,
            state: "active"
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          title
          start
          end
          space {
            id
            name
          }
        }
      }`,
      variables: {"prop": proposals}
    })
  })
  return response.json()
}

export async function getParsedProposals(address) {
  const res = await getProposals(address);

  //storing proposals in an array
  var props = [];
  let propLen = 0;
  if(res)
  propLen = res.data.proposals.length;
  if(propLen == 0) {
      props.push("No proposals");
  }
  else {
      for(let i=0; i<propLen; i++) {
          var daos = res.data.proposals[i];
          var date = new Date(daos.end - daos.start);
          var hours = date.getHours();
          var data = "{" + "\n" + "Title: " + daos.title + "\n" + "Space: " + daos.space.name + "\n" + "Time left: " + hours + " hours" + "\n" + "}" ;
          props.push(data);
      }
  }

  //remove commas from array
  const parsed_props = props.toString().replace(/,/g, "\n");

  return parsed_props;
}
