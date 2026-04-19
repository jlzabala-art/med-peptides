PROJECT  
Semantic AI Search for Peptide Catalog Website

OBJECTIVE

Build an advanced semantic search feature that improves traditional website search.

This feature must be integrated into the existing website search experience, not built as a standalone application.

Traditional e-commerce search matches exact keywords, product names, or tags.

This new Semantic AI Search must understand user intent and meaning even if the user does not know the peptide name.

Example user queries:

"peptides for slow recovery and low energy"  
"something for metabolism and longevity"  
"support for sleep and recovery"  
"options related to hormonal optimization"  
"products for performance and focus"

The system should interpret the user's goal and return the most relevant peptides from the catalog.

\--------------------------------------------------

USER EXPERIENCE

1\. Keep the existing search bar.

Example placeholder:

Search products

2\. Add a secondary AI-powered search trigger next to the search bar.

Possible labels:  
Smart Search  
Semantic Search  
AI Search  
Peptide Match

Preferred label:  
Semantic Search

3\. When the user activates Semantic Search:

Allow the user to type a natural-language query describing their goal.

Do not force a multi-step quiz.

Provide optional example prompts below the input:

Example:  
peptides for recovery and inflammation  
support for metabolism and fat loss  
options for sleep and recovery  
products related to longevity and energy

4\. After submitting the query:

The system must interpret the meaning of the query and return the most relevant peptides from the catalog.

\--------------------------------------------------

CORE CONCEPT

Standard search:  
Matches keywords and product names.

Semantic search:  
Understands meaning, intent, and related concepts.

Example mappings:

Recovery may correspond to:  
healing  
repair  
inflammation  
post workout recovery  
tissue support

Fat loss may correspond to:  
metabolism  
body composition  
weight control  
appetite support

Longevity may correspond to:  
healthy aging  
optimization  
mitochondrial support  
cellular support

Energy may correspond to:  
low energy  
fatigue  
endurance  
mitochondrial function

Sleep may correspond to:  
rest  
recovery  
optimization  
night recovery

The search system must recognize these semantic relationships.

\--------------------------------------------------

SEARCH ENGINE LOGIC

Use a hybrid deterministic \+ semantic logic approach.

Do not rely purely on LLM reasoning.

STEP 1  
Normalize the user query.

Extract tokens and semantic concepts.

STEP 2  
Map the query to structured catalog attributes.

Each peptide must contain structured attributes such as:

goals  
secondaryFactors  
tags  
mechanisms  
semanticKeywords  
synonyms  
shortDescription

STEP 3  
Score peptides using deterministic rules.

Example scoring:

\+5 if peptide strongly matches inferred primary goal  
\+3 if peptide matches secondary concern  
\+4 if semanticKeywords match query meaning  
\+4 if synonyms match query meaning  
\+2 if tags match query  
\+2 if mechanisms match query concepts  
\+1 if commercially available

Sort peptides by score.

STEP 4  
Return the top 3 to 5 peptides.

STEP 5  
Optionally use Gemini AI only to generate short explanations for the already filtered peptides.

\--------------------------------------------------

IMPORTANT AI SAFETY RULES

The AI system must:

Never invent products  
Only recommend peptides from the catalog  
Avoid disease-treatment claims  
Avoid diagnosis language  
Avoid prescription language  
Avoid dosage recommendations

Preferred wording:

may be relevant for  
commonly considered for  
potentially aligned with your search  
often explored in this category

\--------------------------------------------------

RESULTS UI

Display a section titled:

Best Matches for Your Search

Each result card should contain:

Peptide name

Short explanation  
Example:  
This peptide may be relevant based on your interest in recovery and low energy support.

Tags  
Example:  
Recovery  
Metabolism  
Longevity  
Performance

Relevance score or match score

Caution note

Example:  
For informational catalog guidance only. Professional review recommended.

\--------------------------------------------------

DETECTED INTENT FEATURE

Show a small section called:

Detected Search Themes

Example output:

Recovery  
Low energy  
Metabolism  
Longevity  
Performance

This helps the user understand how the system interpreted their query.

\--------------------------------------------------

DISCLAIMER

Display a disclaimer at the bottom of results:

These suggestions are generated for informational and catalog guidance purposes only. They do not constitute medical advice, diagnosis, or prescription. Any peptide-related decision should be reviewed by a qualified healthcare professional.

\--------------------------------------------------

DATA MODEL

Each peptide must include structured semantic attributes.

Example structure:

id  
name  
shortDescription  
goals  
secondaryFactors  
tags  
mechanisms  
semanticKeywords  
synonyms  
route  
evidenceLevel  
cautionNote  
commercialAvailability  
scoreWeight

\--------------------------------------------------

EXAMPLE PEPTIDE ENTRY

Example for MOTS-C:

id: motsc  
name: MOTS-C  
shortDescription: Often associated with metabolism and optimization-oriented searches.

goals:  
fat\_loss  
metabolism  
longevity

secondaryFactors:  
low\_energy  
weight\_control

tags:  
metabolism  
energy  
longevity

mechanisms:  
metabolic support  
mitochondrial support

semanticKeywords:  
metabolism  
fat loss  
body composition  
energy  
mitochondria  
optimization  
longevity

synonyms:  
metabolic peptide  
longevity metabolism support

route:  
subcutaneous

evidenceLevel:  
research

cautionNote:  
For informational catalog guidance only.

commercialAvailability:  
true

scoreWeight:  
3

\--------------------------------------------------

BASIC SEMANTIC MATCHING LOGIC

Normalize user query and compare against semantic attributes.

Example logic:

normalize query text

check matches against:

goals  
secondaryFactors  
tags  
mechanisms  
semanticKeywords  
synonyms

increase score accordingly.

Rank peptides by matchScore.

Return top results.

\--------------------------------------------------

OPTIONAL AI STEP

After deterministic ranking, send the top candidates to Gemini.

Gemini can be used to:

generate user-friendly explanations  
summarize why the peptide matched  
rewrite explanations clearly

Gemini must only receive:

user query  
top filtered candidates

Gemini must return strict JSON.

If Gemini fails, the system must still display deterministic results.

\--------------------------------------------------

UI DESIGN STYLE

Design must feel:

premium  
modern  
minimal  
clean  
medical / wellness oriented

Use:

soft colors  
generous whitespace  
clean typography  
simple product cards  
mobile-first layout

Avoid clutter.

\--------------------------------------------------

ICON DESIGN

Create an icon for Semantic Search.

Concept:

A magnifying glass combined with subtle semantic lines or connected nodes inside.

Meaning:

magnifying glass \= search  
semantic lines or nodes \= interpretation of meaning and context

Optional detail:

small sparkle or glow to suggest AI enhancement.

Style:

minimal  
modern  
premium  
clean  
suitable for medical ecommerce

Avoid cartoon or robotic imagery.

\--------------------------------------------------

MICROCOPY

Helper text under the search bar:

Search by name, or describe your goal in your own words.

Example placeholder text:

Example: peptides for recovery and low energy

\--------------------------------------------------

FINAL GOAL

Deliver a semantic product discovery system that allows users to find relevant peptides using natural language queries instead of relying only on exact keyword matches.

The feature should feel like a smarter evolution of standard e-commerce search rather than a separate application.  
