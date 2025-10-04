import React from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeFromMistral } from "../ai"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Main() {
    const [ingredients, setIngredients] = React.useState(
        []
    )
    const [recipe, setRecipe] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const recipeSection = React.useRef(null)
    
    React.useEffect(() => {
        if (recipe !== "" && recipeSection.current !== null) {
            const yCoord = recipeSection.current.getBoundingClientRect().top + window.scrollY
            window.scroll({
                top: yCoord,
                behavior: "smooth"
            })
        }
    }, [recipe])

    async function getRecipe() {
        setLoading(true)
        const recipeMarkdown = await getRecipeFromMistral(ingredients)
        setRecipe(recipeMarkdown)
        setLoading(false)
    }

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredients => [...prevIngredients, newIngredient])
    }
    
    return (
        <main>
            <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                addIngredient(formData)
                e.currentTarget.reset()
            }} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ref={recipeSection}
                    ingredients={ingredients}
                    getRecipe={getRecipe}
                />
            }

            {loading && (
                <section className="loading-container" aria-live="polite">
                    <h2>🧑‍🍳 Chef Claude is cooking up a recipe...</h2>
                    <p>Please wait while we generate your personalized recipe. This may take a few seconds.</p>
                </section>
            )}

            {recipe && !loading && (
                <>
                    <ClaudeRecipe recipe={recipe} />
                    <div className="another-recipe-container">
                        <button onClick={getRecipe} className="another-recipe-btn">
                            🔄 Get Another Recipe
                        </button>
                        <p className="hint-text">Want a different recipe with the same ingredients? Click above!</p>
                    </div>
                </>
            )}
            <Analytics />
            <SpeedInsights />
        </main>
    )
}